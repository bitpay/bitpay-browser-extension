import { browser, Tabs } from 'webextension-polyfill-ts';
import * as uuid from 'uuid';
import { fetchAvailableCards } from '../services/gift-card';
import { CardConfig, GiftCardInvoiceMessage } from '../services/gift-card.types';
import { removeProtocolAndWww } from '../services/utils';
import { isBitPayAccepted, getMerchants, Merchant, fetchCachedMerchants } from '../services/merchant';
import { get, set } from '../services/storage';
import { fetchDirectIntegrations, DirectIntegration } from '../services/directory';

let cachedMerchants: Merchant[] | undefined;
const invoiceEventResolveFunctionMap: {
  [invoiceId: string]: (message: GiftCardInvoiceMessage) => GiftCardInvoiceMessage;
} = {};
const windowIdInvoiceMap: { [windowId: number]: string } = {};

function getIconPath(bitpayAccepted: boolean): string {
  return `/assets/icons/favicon${bitpayAccepted ? '-active' : ''}-128.png`;
}

function setIcon(bitpayAccepted: boolean): void {
  browser.browserAction.setIcon({ path: getIconPath(bitpayAccepted) });
}

async function getCachedMerchants(): Promise<Merchant[]> {
  return cachedMerchants || fetchCachedMerchants();
}

async function handleUrlChange(host: string): Promise<void> {
  const merchants = await getCachedMerchants();
  const bitpayAccepted = !!(host && isBitPayAccepted(host, merchants));
  return setIcon(bitpayAccepted);
}

async function createClientIdIfNotExists(): Promise<void> {
  const clientId = await get<string>('clientId');
  if (!clientId) {
    await set<string>('clientId', uuid.v4());
  }
}

async function sendMessageToTab(messageName: string, tab: Tabs.Tab): Promise<void> {
  return browser.tabs.sendMessage(tab.id as number, {
    name: messageName
  });
}

browser.tabs.onActivated.addListener(async () => {
  const tabs = await browser.tabs.query({ active: true });
  const { url } = tabs[0];
  const host = url && removeProtocolAndWww(url).split('/')[0];
  const merchants = await getCachedMerchants();
  const bitpayAccepted = !!(host && isBitPayAccepted(host, merchants));
  setIcon(bitpayAccepted);
});

browser.browserAction.onClicked.addListener(async tab => {
  await browser.tabs.sendMessage(tab.id as number, {
    name: 'EXTENSION_ICON_CLICKED'
  });
});

browser.runtime.onInstalled.addListener(async () => {
  const directIntegrations = await fetchDirectIntegrations();
  const availableGiftCards = await fetchAvailableCards();
  cachedMerchants = getMerchants(directIntegrations, availableGiftCards);
  await Promise.all([
    set<DirectIntegration[]>('directIntegrations', directIntegrations),
    set<CardConfig[]>('availableGiftCards', availableGiftCards),
    createClientIdIfNotExists()
  ]);
});

async function launchInvoiceAndListenForPayment(invoiceId: string): Promise<GiftCardInvoiceMessage> {
  const url = `${process.env.API_ORIGIN}/invoice?id=${invoiceId}&v=3?view=modal`;
  const { id } = await browser.windows.create({ url, type: 'popup', height: 735, width: 430 });
  windowIdInvoiceMap[id as number] = invoiceId;
  const promise = new Promise<GiftCardInvoiceMessage>(resolve => {
    invoiceEventResolveFunctionMap[invoiceId] = resolve as () => GiftCardInvoiceMessage;
  });
  const message = await promise;
  return message;
}

browser.runtime.onMessage.addListener(async (message, sender) => {
  const { tab } = sender;
  switch (message && message.name) {
    case 'LAUNCH_INVOICE':
      return tab && launchInvoiceAndListenForPayment(message.invoiceId);
    case 'INVOICE_EVENT': {
      if (!message.data || !message.data.status) {
        return;
      }
      const resolveFn = invoiceEventResolveFunctionMap[message.data.invoiceId];
      return resolveFn && resolveFn(message);
    }
    case 'URL_CHANGED':
      return handleUrlChange(message.host);
    default:
      return tab && sendMessageToTab(message.name, tab);
  }
});

browser.windows.onRemoved.addListener(windowId => {
  const invoiceId = windowIdInvoiceMap[windowId];
  const resolveFn = invoiceEventResolveFunctionMap[invoiceId];
  return resolveFn && resolveFn({ data: { status: 'closed' } });
});
