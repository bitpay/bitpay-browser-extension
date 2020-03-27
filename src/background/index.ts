import { browser } from 'webextension-polyfill-ts';
import { fetchAvailableCards } from '../services/gift-card';
import { CardConfig } from '../services/gift-card.types';
import { removeProtocolAndWww } from '../services/utils';
import { isBitPayAccepted } from '../services/merchant';

let cachedMerchants: CardConfig[] | undefined;

function getIconPath(bitpayAccepted: boolean): string {
  return `/assets/icons/favicon${bitpayAccepted ? '-active' : ''}-128.png`;
}

function setIcon(bitpayAccepted: boolean): void {
  browser.browserAction.setIcon({ path: getIconPath(bitpayAccepted) });
}

async function getCachedMerchants(): Promise<CardConfig[]> {
  const { availableGiftCards } = cachedMerchants
    ? { availableGiftCards: cachedMerchants }
    : ((await browser.storage.local.get('availableGiftCards')) as { availableGiftCards: CardConfig[] });
  return availableGiftCards;
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
    action: 'EXTENSION_ICON_CLICKED'
  });
});

browser.runtime.onInstalled.addListener(async () => {
  console.log('on installed');
  const availableGiftCards = await fetchAvailableCards();
  cachedMerchants = availableGiftCards;
  await browser.storage.local.set({ availableGiftCards });
});

browser.runtime.onMessage.addListener(async message => {
  console.log('message', message);
  const merchants = await getCachedMerchants();
  const bitpayAccepted = message.host && isBitPayAccepted(message.host, merchants);
  return message.name === 'URL_CHANGED' && setIcon(bitpayAccepted);
});
