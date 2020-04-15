import { browser } from 'webextension-polyfill-ts';

function getKeyString(key: string): string {
  return process.env.NODE_ENV === 'production' || process.env.API_ORIGIN === 'https://bitpay.com'
    ? key
    : `${process.env.API_ORIGIN}_${key}`;
}

export async function get<T>(key: string): Promise<T> {
  const keys = await browser.storage.local.get(getKeyString(key));
  return keys[getKeyString(key)];
}

export function set<T>(key: string, value: T): Promise<void> {
  return browser.storage.local.set({ [getKeyString(key)]: value });
}

export function remove(key: string): Promise<void> {
  return browser.storage.local.remove(getKeyString(key));
}
