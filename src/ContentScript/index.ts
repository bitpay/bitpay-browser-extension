import { browser } from 'webextension-polyfill-ts';

let iframe: HTMLIFrameElement | undefined;

function createIframe(): HTMLIFrameElement {
  const frame = document.createElement('iframe');
  frame.src = browser.runtime.getURL('popup.html');
  frame.style.cssText = `
    position:fixed;
    overflow:hidden;
    top:10px;
    right:10px;
    display:block;
    border: 0;
    box-shadow: 0 0 14px 4px rgba(0,0,0,0.1); 
    border-radius: 8px;
    width:300px;
    height:367px;
    z-index:2147483647;
  `;
  document.body.appendChild(frame);
  return frame;
}

function removeIframe(frame: HTMLIFrameElement): void {
  document.body.removeChild(frame);
  iframe = undefined;
}

function addIframe(frame: HTMLIFrameElement): void {
  iframe = frame;
  document.body.appendChild(frame);
}

browser.runtime.onMessage.addListener(() => {
  return iframe ? removeIframe(iframe) : addIframe(createIframe());
});

export {};
