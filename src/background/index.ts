import { browser } from 'webextension-polyfill-ts';
import { fetchAvailableCards } from '../services/gift-card';
import { CardConfig } from '../services/gift-card.types';

let availableCards: CardConfig[] | undefined;

function getIconPath(bitpayAccepted: boolean): string {
  return `/assets/icons/favicon${bitpayAccepted ? '-active' : ''}-128.png`;
}

function setIcon(bitpayAccepted: boolean): void {
  browser.browserAction.setIcon({ path: getIconPath(bitpayAccepted) });
}

function removeProtocolAndWww(url: string): string {
  return url.replace(/(^\w+:|^)\/\//, '').replace(/^www\./, '');
}

async function isBitPayAccepted(host: string): Promise<boolean> {
  const { availableGiftCards } = availableCards
    ? { availableGiftCards: availableCards }
    : ((await browser.storage.local.get('availableGiftCards')) as { availableGiftCards: CardConfig[] });
  const bareHost = host.replace(/^www\./, '');
  const cardConfig = availableGiftCards.find(config => removeProtocolAndWww(config.website).startsWith(bareHost));
  return !!cardConfig;
}

browser.tabs.onActivated.addListener(async () => {
  const tabs = await browser.tabs.query({ active: true });
  const { url } = tabs[0];
  const host = url && removeProtocolAndWww(url).split('/')[0];
  const bitpayAccepted = !!(host && (await isBitPayAccepted(host)));
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
  availableCards = availableGiftCards;
  await browser.storage.local.set({ availableGiftCards });
});

browser.runtime.onMessage.addListener(async message => {
  console.log('message', message);
  const bitpayAccepted = await isBitPayAccepted(message.host);
  return message.name === 'URL_CHANGED' && setIcon(bitpayAccepted);
});
