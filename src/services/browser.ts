import { browser } from 'webextension-polyfill-ts';

export const launchNewTab = (url: string): void => {
  browser.tabs.create({ url });
};
