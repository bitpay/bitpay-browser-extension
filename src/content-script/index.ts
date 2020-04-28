import { browser } from 'webextension-polyfill-ts';
import { FrameDimensions } from '../services/frame';
import { dispatchUrlChange } from '../services/browser';
import { Merchant } from '../services/merchant';
import { CheckoutPageCssSelectors } from '../services/gift-card.types';

let iframe: HTMLIFrameElement | undefined;

const getOrderTotal = (selector: string): number | undefined => {
  const element = document.querySelector(selector);
  return element ? parseFloat(element.innerHTML.trim().replace(/[^0-9.]/g, '')) : undefined;
};

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
    clip: auto!important;
    display: block!important;
    width: ${FrameDimensions.width}px;
    height: ${FrameDimensions.collapsedHeight}px;
    opacity: 1!important;
    position: fixed!important;
    top: 10px;
    right: 10px;
    box-shadow: 0 0 14px 4px rgba(0,0,0,0.1); 
    border-radius: 8px;
    z-index: 2147483647!important;
    transition: height 250ms ease 0s;
  `;
  return { outerFrameStyles, innerFrameStyles };
}

function createIframe({ merchant }: { merchant?: Merchant }): HTMLIFrameElement {
  const outerFrame = document.createElement('iframe');
  const baseUrl = browser.runtime.getURL('popup.html');
  const cardConfig = merchant && merchant.giftCards[0];
  const orderTotal = cardConfig?.cssSelectors && getOrderTotal(cardConfig.cssSelectors.orderTotal[0]);
  const innerFrameSrc = `${baseUrl}?url=${window.location.href}${orderTotal ? `&amount=${orderTotal}` : ''}`;
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

function injectValueIntoInputsWithSelectors(selectors: string[], value: string): void {
  selectors.forEach(selector => {
    const input = document.querySelector(selector) as HTMLInputElement | undefined;
    if (input) input.value = value;
  });
}

browser.runtime.onMessage.addListener(async message => {
  const messageName = message && message.name;
  switch (messageName) {
    case 'EXTENSION_ICON_CLICKED':
      return iframe ? removeIframe(iframe) : addIframe(createIframe({ merchant: message.merchant }));
    case 'INJECT_CLAIM_INFO':
      // eslint-disable-next-line no-case-declarations
      const { cssSelectors, claimInfo } = message as {
        cssSelectors: CheckoutPageCssSelectors;
        claimInfo: { claimCode: string; pin?: string };
      };
      injectValueIntoInputsWithSelectors(cssSelectors.claimCodeInput, claimInfo.claimCode);
      if (claimInfo.pin) injectValueIntoInputsWithSelectors(cssSelectors.pinInput, claimInfo.pin);
      return;
    case 'POPUP_CLOSED':
      return iframe && removeIframe(iframe);
    case 'POPUP_RESIZED':
      return iframe && resizeIframe(iframe, message.height);
    default:
      console.log('Unsupported Event:', message);
  }
});

if (document.visibilityState !== 'hidden') {
  dispatchUrlChange(window);
}
document.addEventListener(
  'visibilitychange',
  () => {
    if (document.visibilityState !== 'hidden') {
      dispatchUrlChange(window);
    }
  },
  false
);

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
    window.postMessage({ message: 'pairingOnly' }, process.env.API_ORIGIN);
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
