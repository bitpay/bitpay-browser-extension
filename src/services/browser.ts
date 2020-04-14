import { browser } from 'webextension-polyfill-ts';

export const launchNewTab = (url: string): void => {
  browser.tabs.create({ url });
};

export const goToPage = (link: string): void => {
  let website = link;
  const detectProtocolPresent = /^https?:\/\//i;
  if (!detectProtocolPresent.test(link)) {
    website = `https://${link}`;
  }
  browser.tabs.update({
    url: website
  });
};
