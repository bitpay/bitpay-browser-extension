import { browser, Tabs } from 'webextension-polyfill-ts';
import * as uuid from 'uuid';
import { fetchAvailableCards } from '../services/gift-card';
import { CardConfig, GiftCardInvoiceMessage } from '../services/gift-card.types';
import { removeProtocolAndWww } from '../services/utils';
import { isBitPayAccepted, getMerchants, Merchant, fetchCachedMerchants } from '../services/merchant';
import { get, set } from '../services/storage';
import { fetchDirectIntegrations, DirectIntegration } from '../services/directory';

let cachedMerchants: Merchant[] | undefined;
let cacheDate = 0;
const cacheValidityDuration: number = 1000 * 60;

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

function addToSupportedGiftCards(supportedGiftCards: CardConfig[], availableGiftCards: CardConfig[]): CardConfig[] {
  const combinedGiftCards = availableGiftCards.concat(supportedGiftCards);
  const giftCardsMappedByName = new Map(combinedGiftCards.map(config => [config.name, config]));
  return Array.from(giftCardsMappedByName.values());
}

async function getCachedMerchants(): Promise<Merchant[]> {
  return cachedMerchants || fetchCachedMerchants();
}

async function refreshCachedMerchants(): Promise<void> {
  const [directIntegrations, availableGiftCards, supportedGiftCards = []] = await Promise.all([
    fetchDirectIntegrations().catch(() => []),
    fetchAvailableCards().catch(() => []),
    get<CardConfig[]>('supportedGiftCards')
  ]);
  cachedMerchants = getMerchants(directIntegrations, availableGiftCards);
  cacheDate = Date.now();
  const newSupportedGiftCards = addToSupportedGiftCards(supportedGiftCards, availableGiftCards);
  await Promise.all([
    set<DirectIntegration[]>('directIntegrations', directIntegrations),
    set<CardConfig[]>('availableGiftCards', availableGiftCards),
    set<CardConfig[]>('supportedGiftCards', newSupportedGiftCards)
  ]);
}

async function refreshCachedMerchantsIfNeeded(): Promise<void> {
  if (Date.now() > cacheDate + cacheValidityDuration) await refreshCachedMerchants();
}

async function handleUrlChange(host: string): Promise<void> {
  const merchants = await getCachedMerchants();
  const bitpayAccepted = !!(host && isBitPayAccepted(host, merchants));
  await setIcon(bitpayAccepted);
  await refreshCachedMerchantsIfNeeded();
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

browser.tabs.onActivated.addListener(async data => {
  const tabs = await browser.tabs.query({ active: true, windowId: data.windowId });
  const { url } = tabs.find(tab => tab.id === data.tabId) || { url: '' };
  const host = url && removeProtocolAndWww(url).split('/')[0];
  const merchants = await getCachedMerchants();
  const bitpayAccepted = !!(host && isBitPayAccepted(host, merchants));
  setIcon(bitpayAccepted);
  await refreshCachedMerchantsIfNeeded();
});

browser.browserAction.onClicked.addListener(async tab => {
  await browser.tabs.sendMessage(tab.id as number, {
    name: 'EXTENSION_ICON_CLICKED'
  });
});

browser.runtime.onInstalled.addListener(async () => {
  await Promise.all([refreshCachedMerchants(), createClientIdIfNotExists()]);
});

async function launchInvoiceAndListenForPayment(invoiceId: string): Promise<GiftCardInvoiceMessage> {
  const url = `${process.env.API_ORIGIN}/invoice?id=${invoiceId}?view=modal`;
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
