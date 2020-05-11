import { browser } from 'webextension-polyfill-ts';
import { CardConfig } from './gift-card.types';

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
    url: window.location.href
  });
};

export const dispatchAnalyticsEvent = (event: { [key: string]: string }): void => {
  browser.runtime.sendMessage(undefined, {
    name: 'TRACK',
    event
  });
};

export const injectClaimInfo = (cardConfig: CardConfig, claimInfo: { claimCode: string; pin?: string }): void => {
  browser.runtime.sendMessage(undefined, {
    name: 'INJECT_CLAIM_INFO',
    cssSelectors: cardConfig.cssSelectors,
    claimInfo
  });
};

export const refreshMerchantCache = (): void => {
  browser.runtime.sendMessage(undefined, {
    name: 'REFRESH_MERCHANT_CACHE'
  });
};
