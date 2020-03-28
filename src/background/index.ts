import { browser, Tabs } from 'webextension-polyfill-ts';
import * as uuid from 'uuid';
import { fetchAvailableCards } from '../services/gift-card';
import { CardConfig } from '../services/gift-card.types';
import { removeProtocolAndWww } from '../services/utils';
import { isBitPayAccepted } from '../services/merchant';
import { get, set } from '../services/storage';

let cachedMerchants: CardConfig[] | undefined;

function getIconPath(bitpayAccepted: boolean): string {
  return `/assets/icons/favicon${bitpayAccepted ? '-active' : ''}-128.png`;
}

function setIcon(bitpayAccepted: boolean): void {
  browser.browserAction.setIcon({ path: getIconPath(bitpayAccepted) });
}

async function getCachedMerchants(): Promise<CardConfig[]> {
  return cachedMerchants || get<CardConfig[]>('availableGiftCards');
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

async function sendMessageToTab(messageName: string, tab: Tabs.Tab | undefined): Promise<void> {
  return (
    tab &&
    browser.tabs.sendMessage(tab.id as number, {
      name: messageName
    })
  );
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
  console.log('on installed');
  const availableGiftCards = await fetchAvailableCards();
  cachedMerchants = availableGiftCards;
  await Promise.all([set<CardConfig[]>('availableGiftCards', availableGiftCards), createClientIdIfNotExists()]);
});

browser.runtime.onMessage.addListener(async (message, sender) => {
  switch (message && message.name) {
    case 'LAUNCH_PAGE':
      return browser.windows.create({ url: message.url, type: 'popup', height: 735, width: 430 });
    case 'URL_CHANGED':
      return handleUrlChange(message.host);
    default:
      return sendMessageToTab(message.name, sender.tab);
  }
});
