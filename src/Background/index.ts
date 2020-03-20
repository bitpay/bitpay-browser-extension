import { browser } from 'webextension-polyfill-ts';

browser.browserAction.onClicked.addListener(async tab => {
  await browser.tabs.sendMessage(tab.id as number, {
    action: 'EXTENSION_ICON_CLICKED'
  });
});
