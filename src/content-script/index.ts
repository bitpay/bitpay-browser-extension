import { browser } from 'webextension-polyfill-ts';

let iframe: HTMLIFrameElement | undefined;

enum FrameDimensions {
  collapsedHeight = '50px',
  height = '529px',
  width = '300px'
}

function getIframeStyles(): { outerFrameStyles: string; innerFrameStyles: string } {
  const innerFrameStyles = `
    width: ${FrameDimensions.width};
    height: ${FrameDimensions.height}; 
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
  return { outerFrameStyles, innerFrameStyles };
}

function createIframe(): HTMLIFrameElement {
  const outerFrame = document.createElement('iframe');
  const baseUrl = browser.runtime.getURL('popup.html');
  const innerFrameSrc = `${baseUrl}?url=${window.location.href}`;
  const { innerFrameStyles, outerFrameStyles } = getIframeStyles();
  outerFrame.srcdoc = `
    <body style="${innerFrameStyles}">
      <iframe src="${innerFrameSrc}" style="${innerFrameStyles}">frameSrc</iframe>
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

function collapseIframe(frame: HTMLIFrameElement): void {
  frame.style.height = FrameDimensions.collapsedHeight;
}

function expandIframe(frame: HTMLIFrameElement): void {
  frame.style.height = FrameDimensions.height;
}

browser.runtime.onMessage.addListener(message => {
  switch (message && message.name) {
    case 'EXTENSION_ICON_CLICKED':
      return iframe ? removeIframe(iframe) : addIframe(createIframe());
    case 'POPUP_CLOSED':
      return iframe && removeIframe(iframe);
    case 'POPUP_COLLAPSED':
      return iframe && collapseIframe(iframe);
    case 'POPUP_EXPANDED':
      return iframe && expandIframe(iframe);
    default:
      console.log('Unsupported Event:', message);
  }
});

if (document.visibilityState !== 'hidden') {
  browser.runtime.sendMessage(undefined, {
    name: 'URL_CHANGED',
    url: window.location.href,
    origin: window.location.origin,
    host: window.location.host
  });
}

export {};
