import { browser, Tabs } from 'webextension-polyfill-ts';
import * as uuid from 'uuid';
import { dispatchEvent } from '../services/analytics';
import { GiftCardInvoiceMessage } from '../services/gift-card.types';
import {
  isBitPayAccepted,
  Merchant,
  fetchCachedMerchants,
  getBitPayMerchantFromUrl,
  fetchDirectoryAndMerchants
} from '../services/merchant';
import { get, set } from '../services/storage';
import { generatePairingToken } from '../services/bitpay-id';

let cachedMerchants: Merchant[] | undefined;
let cacheDate = 0;
const cacheValidityDuration = 1000 * 60;

const windowIdResolveMap: { [windowId: number]: (message: GiftCardInvoiceMessage) => GiftCardInvoiceMessage } = {};

function getIconPath(bitpayAccepted: boolean): string {
  return `/assets/icons/favicon${bitpayAccepted ? '' : '-inactive'}-128.png`;
}

function setIcon(bitpayAccepted: boolean): void {
  browser.browserAction.setIcon({ path: getIconPath(bitpayAccepted) });
}

async function getCachedMerchants(): Promise<Merchant[]> {
  return cachedMerchants || fetchCachedMerchants();
}

async function refreshCachedMerchants(): Promise<void> {
  cachedMerchants = await fetchCachedMerchants();
  cacheDate = Date.now();
}

async function refreshCachedMerchantsIfNeeded(): Promise<void> {
  if (Date.now() < cacheDate + cacheValidityDuration) return;
  return fetchDirectoryAndMerchants()
    .then(() => refreshCachedMerchants())
    .catch(err => console.log('Error refreshing merchants', err));
}

function isGiftCardInvoice(url: string): boolean {
  return url.startsWith(process.env.API_ORIGIN as string) && url.includes('/invoice?id=') && url.includes('view=popup');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendMessageToTab(message: any, tab: Tabs.Tab): Promise<void> {
  return browser.tabs.sendMessage(tab.id as number, message);
}

async function handleUrlChange(url: string, tab?: Tabs.Tab): Promise<void> {
  const merchants = await getCachedMerchants();
  const bitpayAccepted = isBitPayAccepted(url, merchants);
  const merchant = getBitPayMerchantFromUrl(url, merchants);
  const promptAtCheckout = await get<boolean>('promptAtCheckout');
  if (merchant && tab && promptAtCheckout) {
    sendMessageToTab({ merchant, name: 'SHOW_WIDGET_IN_PAY_MODE' }, tab);
  }
  await setIcon(bitpayAccepted || isGiftCardInvoice(url));
  await refreshCachedMerchantsIfNeeded();
  if (isGiftCardInvoice(url)) return;
  dispatchEvent({
    action: `setExtensionIcon:${
      merchant ? `active:${merchant.hasDirectIntegration ? 'direct' : 'giftCard'}` : `inactive`
    }`
  });
}

async function createClientIdIfNotExists(): Promise<void> {
  const clientId = await get<string>('clientId');
  const analyticsClientId = await get<string>('analyticsClientId');
  if (!clientId) {
    await set<string>('clientId', uuid.v4());
  }
  if (!analyticsClientId) {
    await set<string>('analyticsClientId', uuid.v4());
  }
  clientId ? dispatchEvent({ action: 'updatedExtension' }) : dispatchEvent({ action: 'installedExtension' });
}

browser.browserAction.onClicked.addListener(async tab => {
  const merchant = tab.url && getBitPayMerchantFromUrl(tab.url, await getCachedMerchants());
  await browser.tabs
    .sendMessage(tab.id as number, {
      name: 'EXTENSION_ICON_CLICKED',
      merchant
    })
    .catch(() => browser.tabs.create({ url: `${process.env.API_ORIGIN}/extension?launchExtension=true` }));
});

browser.runtime.onInstalled.addListener(async () => {
  const allTabs = await browser.tabs.query({});
  allTabs.forEach(tab =>
    browser.tabs.executeScript(tab.id, { file: 'js/contentScript.bundle.js' }).catch(() => undefined)
  );
  await Promise.all([refreshCachedMerchantsIfNeeded(), createClientIdIfNotExists()]);
});

async function launchWindowAndListenForEvents({
  url,
  height = 735,
  width = 430
}: {
  url: string;
  height: number;
  width: number;
}): Promise<GiftCardInvoiceMessage> {
  const { id, height: winHeight, width: winWidth } = await browser.windows.create({
    url,
    type: 'popup',
    height,
    width
  });
  if ((winHeight as number) !== height || (winWidth as number) !== width) {
    await browser.windows.update(id as number, { height, width });
  }
  const promise = new Promise<GiftCardInvoiceMessage>(resolve => {
    windowIdResolveMap[id as number] = resolve as () => GiftCardInvoiceMessage;
  });
  const message = await promise;
  return message;
}

async function pairBitpayId(payload: { secret: string; code?: string }): Promise<void> {
  await generatePairingToken(payload);
}

browser.runtime.onMessage.addListener(async (message, sender) => {
  const { tab } = sender;
  switch (message && message.name) {
    case 'LAUNCH_TAB':
      return browser.tabs.create({ url: message.url });
    case 'LAUNCH_WINDOW':
      return tab && launchWindowAndListenForEvents(message);
    case 'ID_CONNECTED': {
      const resolveFn = windowIdResolveMap[tab?.windowId as number];
      delete windowIdResolveMap[tab?.windowId as number];
      browser.tabs.remove(tab?.id as number).catch(() => {
        if (tab?.id) {
          browser.tabs.executeScript(tab?.id as number, { code: 'window.close()' });
        }
      });
      await pairBitpayId(message.data);
      return resolveFn && resolveFn({ data: { status: 'complete' } });
    }
    case 'INVOICE_EVENT': {
      if (!message.data || !message.data.status) {
        return;
      }
      const resolveFn = windowIdResolveMap[tab?.windowId as number];
      return resolveFn && resolveFn(message);
    }
    case 'REDIRECT':
      return browser.tabs.update({
        url: message.url
      });
    case 'REFRESH_MERCHANT_CACHE':
      return refreshCachedMerchants();
    case 'TRACK':
      return dispatchEvent(message.event);
    case 'URL_CHANGED':
      return message.url && handleUrlChange(message.url, tab);
    default:
      return tab && sendMessageToTab(message, tab);
  }
});

browser.windows.onRemoved.addListener(windowId => {
  const resolveFn = windowIdResolveMap[windowId];
  return resolveFn && resolveFn({ data: { status: 'closed' } });
});
