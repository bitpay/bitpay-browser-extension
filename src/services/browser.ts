import { browser } from 'webextension-polyfill-ts';

export const launchNewTab = (url: string): void => {
  browser.runtime.sendMessage({
    name: 'LAUNCH_TAB',
    url
  });
};

export const goToPage = (link: string): void => {
  const detectProtocolPresent = /^https?:\/\//i;
  const url = detectProtocolPresent.test(link) ? link : `https://${link}`;
  browser.runtime.sendMessage({
    name: 'REDIRECT',
    url
  });
};

export const dispatchUrlChange = (window: Window): void => {
  browser.runtime.sendMessage(undefined, {
    name: 'URL_CHANGED',
    url: window.location.href,
    origin: window.location.origin,
    host: window.location.host
  });
};

export const refreshMerchantCache = (): void => {
  browser.runtime.sendMessage(undefined, {
    name: 'REFRESH_MERCHANT_CACHE'
  });
};
