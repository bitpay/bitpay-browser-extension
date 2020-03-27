import { browser } from 'webextension-polyfill-ts';

let iframe: HTMLIFrameElement | undefined;

function createIframe(): HTMLIFrameElement {
  const outerFrame = document.createElement('iframe');
  const baseUrl = browser.runtime.getURL('popup.html');
  const frameSrc = `${baseUrl}?url=${window.location.href}`;
  console.log('frameSrc', frameSrc);
  const innerFrameStyles = `
    width: 300px;
    height: 367px; 
    border: 0;
    margin: 0;
    padding: 0;
    overflow: hidden;
  `;
  const outerFrameStyles = `
    ${innerFrameStyles}
    position: fixed;
    top: 10px;
    right: 10px;
    display: block;
    box-shadow: 0 0 14px 4px rgba(0,0,0,0.1); 
    border-radius: 8px;
    z-index: 2147483647;
  `;
  outerFrame.srcdoc = `
    <body style="${innerFrameStyles}">
      <iframe src="${frameSrc}" style="${innerFrameStyles}">frameSrc</iframe>
    </body>
  `;
  outerFrame.style.cssText = outerFrameStyles;
  document.body.appendChild(outerFrame);
  return outerFrame;
}

function removeIframe(frame: HTMLIFrameElement): void {
  document.body.removeChild(frame);
  iframe = undefined;
}

function addIframe(frame: HTMLIFrameElement): void {
  iframe = frame;
  document.body.appendChild(frame);
}

browser.runtime.onMessage.addListener(() => (iframe ? removeIframe(iframe) : addIframe(createIframe())));

if (document.visibilityState !== 'hidden') {
  browser.runtime.sendMessage(undefined, {
    name: 'URL_CHANGED',
    url: window.location.href,
    origin: window.location.origin,
    host: window.location.host
  });
}

export {};
