import { browser } from 'webextension-polyfill-ts';
import { FrameDimensions } from '../services/frame';

let iframe: HTMLIFrameElement | undefined;

function getIframeStyles(): { outerFrameStyles: string; innerFrameStyles: string } {
  const innerFrameStyles = `
    width: 100%;
    height: 100%; 
    border: 0;
    margin: 0;
    padding: 0;
    overflow: hidden;
  `;
  const outerFrameStyles = `
    ${innerFrameStyles}
    width: ${FrameDimensions.width}px;
    height: ${FrameDimensions.collapsedHeight}px;
    position: fixed;
    top: 10px;
    right: 10px;
    display: block;
    box-shadow: 0 0 14px 4px rgba(0,0,0,0.1); 
    border-radius: 8px;
    z-index: 2147483647;
    transition: height 250ms ease 0s;
  `;
  return { outerFrameStyles, innerFrameStyles };
}

function createIframe(): HTMLIFrameElement {
  const outerFrame = document.createElement('iframe');
  const baseUrl = browser.runtime.getURL('popup.html');
  const innerFrameSrc = `${baseUrl}?url=${window.location.href}`;
  const { innerFrameStyles, outerFrameStyles } = getIframeStyles();
  outerFrame.srcdoc = `
    <html style="height: 100%">
      <body style="${innerFrameStyles}">
        <iframe src="${innerFrameSrc}" style="${innerFrameStyles}">frameSrc</iframe>
      </body>
    </html>
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

function resizeIframe(frame: HTMLIFrameElement, height: number = FrameDimensions.height): void {
  frame.style.height = `${height}px`;
}

browser.runtime.onMessage.addListener(message => {
  const messageName = message && message.name;
  switch (messageName) {
    case 'EXTENSION_ICON_CLICKED':
      return iframe ? removeIframe(iframe) : addIframe(createIframe());
    case 'POPUP_CLOSED':
      return iframe && removeIframe(iframe);
    case 'POPUP_RESIZED':
      return iframe && resizeIframe(iframe, message.height);
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

if (window.location.origin === process.env.API_ORIGIN) {
  if (window.location.href.includes('/invoice')) {
    const invoiceId = new URLSearchParams(window.location.search).get('id');
    window.addEventListener('message', message => {
      browser.runtime.sendMessage(undefined, {
        name: 'INVOICE_EVENT',
        data: message.data
          ? {
              invoiceId,
              status: message.data.status,
              exceptionStatus: message.data.exceptionStatus
            }
          : undefined
      });
    });
  } else if (window.location.href.includes('/wallet-card')) {
    const scriptElement = document.createElement('script');
    scriptElement.innerHTML = `
    window.webkit = {
      messageHandlers: {
        cordova_iab: {
          postMessage: message => {
            window.postMessage(message);
          }
        }
      }
    };
    window.postMessage({ message: 'pairingOnly' });
    `;
    document.head.appendChild(scriptElement);
    window.addEventListener('message', ({ data }) => {
      const dataObj = typeof data === 'string' ? JSON.parse(data) : data;
      const { message, params } = dataObj;
      if (message !== 'pairing') return;
      browser.runtime.sendMessage(undefined, {
        name: 'ID_CONNECTED',
        data: params
      });
    });
  }
}
export {};
