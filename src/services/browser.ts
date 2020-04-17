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
