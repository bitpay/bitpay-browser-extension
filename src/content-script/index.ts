import { browser } from 'webextension-polyfill-ts';
import { FrameDimensions } from '../services/frame';
import { dispatchUrlChange } from '../services/browser';
import { Merchant } from '../services/merchant';
import { CheckoutPageCssSelectors } from '../services/gift-card.types';
import { dragElementFunc, DragMethods } from './drag';
import { safelyParseJSON } from '../services/utils';

const dragElementId = 'BitPayExtensionDrag';
let dragMethods: DragMethods;
let iframe: HTMLIFrameElement | undefined;

const getOrderTotal = (selector: string): number | undefined => {
  const element = document.querySelector(selector);
  return element ? parseFloat(element.innerHTML.trim().replace(/[^0-9.]/g, '')) : undefined;
};

function getIframeStyles(): { outerFrameStyles: string; innerFrameStyles: string; dragElementStyles: string } {
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
    box-shadow: 0 0 12px 4px rgba(0,0,0,0.1); 
    border-radius: 8px;
    z-index: ${FrameDimensions.zIndex} !important;
    transition: height 250ms ease 0s, box-shadow 250ms ease-in-out, transform 250ms cubic-bezier(.25,.8,.25,1);
  `;
  const dragElementStyles = `
    width: 115px; 
    height: ${FrameDimensions.collapsedHeight}px; 
    position: fixed;
    top: 10px;
    right: 75px;
    display: block;
    cursor: grab;
    z-index: ${FrameDimensions.zIndex + 10};
   `;
  return { outerFrameStyles, innerFrameStyles, dragElementStyles };
}

function createIframe({
  merchant,
  initiallyCollapsed = false
}: {
  merchant?: Merchant;
  initiallyCollapsed?: boolean;
}): HTMLIFrameElement {
  const outerFrame = document.createElement('iframe');
  const baseUrl = browser.runtime.getURL('popup.html');
  const cardConfig = merchant && merchant.giftCards[0];
  const orderTotal = cardConfig?.cssSelectors && getOrderTotal(cardConfig.cssSelectors.orderTotal[0]);
  const innerFrameSrc = `${baseUrl}?url=${window.location.href}${
    orderTotal ? `&amount=${orderTotal}` : ''
  }&initiallyCollapsed=${initiallyCollapsed}`;
  const { innerFrameStyles, outerFrameStyles } = getIframeStyles();
  outerFrame.srcdoc = `
    <html style="height: 100%">
      <body style="${innerFrameStyles}">
        <iframe src="${innerFrameSrc}" style="${innerFrameStyles}">frameSrc</iframe>
      </body>
      <script>
        const innerFrame = document.querySelector('iframe');
        window.addEventListener('message', (message) => {
          const contentWindow = innerFrame && innerFrame.contentWindow;
          if(contentWindow && message.data && message.data.message === 'draggedWidget') {
            contentWindow.postMessage(message.data, '*');
          }
        })
      </script>
    </html>
  `;
  outerFrame.style.cssText = outerFrameStyles;
  document.body.appendChild(outerFrame);
  return outerFrame;
}

function getDragElement(): HTMLElement | null {
  return document.getElementById(dragElementId);
}

function removeDragElement(): void {
  const el = getDragElement();
  if (el) {
    document.body.removeChild(el);
  }
}

function addDragElement(): void {
  const dragElement = document.createElement('div');
  const { dragElementStyles } = getIframeStyles();
  dragElement.style.cssText = dragElementStyles;
  dragElement.classList.add('drag-element');
  dragElement.setAttribute('id', dragElementId);
  document.body.appendChild(dragElement);

  const dragEle = getDragElement();
  if (dragEle) {
    dragMethods = dragElementFunc(iframe, dragEle);
  }
}

function removeIframe(frame: HTMLIFrameElement): void {
  removeDragElement();
  document.body.removeChild(frame);
  iframe = undefined;
}

function addIframe(frame: HTMLIFrameElement): void {
  iframe = frame;
  document.body.appendChild(frame);
  addDragElement();
}

function resizeIframe(frame: HTMLIFrameElement, height: number = FrameDimensions.height): void {
  frame.style.height = `${height}px`;
}

function resetIframePosition(frame: HTMLIFrameElement, top: number, left: number): void {
  frame.style.top = `${top}px`;
  frame.style.left = `${left}px`;
}

function injectValueIntoInputsWithSelectors(selectors: string[] = [], value = ''): void {
  selectors.forEach(selector => {
    const input = document.querySelector(selector) as HTMLInputElement | undefined;
    if (input && !input.value) {
      input.setAttribute('value', value);
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('blur', { bubbles: true }));
    }
  });
}

function toggleIframeVisibility({
  merchant,
  initiallyCollapsed = false
}: {
  merchant?: Merchant;
  initiallyCollapsed?: boolean;
} = {}): void {
  iframe ? removeIframe(iframe) : addIframe(createIframe({ merchant, initiallyCollapsed }));
}

function autoShowCollapsedWidgetIfSupportedMerchant(merchant: Merchant): void {
  const cardConfig = merchant.giftCards[0];
  const orderTotal = cardConfig?.cssSelectors && getOrderTotal(cardConfig.cssSelectors.orderTotal[0]);
  if (orderTotal && !iframe) toggleIframeVisibility({ merchant, initiallyCollapsed: true });
}

browser.runtime.onMessage.addListener(async message => {
  const messageName = message && message.name;
  switch (messageName) {
    case 'EXTENSION_ICON_CLICKED':
      toggleIframeVisibility({ merchant: message.merchant });
      return;
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
      removeDragElement();
      return iframe && removeIframe(iframe);
    case 'POPUP_RESIZED':
      return iframe && resizeIframe(iframe, message.height);
    case 'NAVBAR_MODE_CHANGED':
      dragMethods.onNavbarModeChange(message.mode);
      return;
    case 'RESET_FRAME_POSITION':
      // eslint-disable-next-line no-case-declarations
      const contentWindow = iframe && iframe.contentWindow;
      if (contentWindow) contentWindow.postMessage({ message: 'draggedWidget' }, '*');
      return iframe && resetIframePosition(iframe, message.top, message.left);
    case 'SHOW_WIDGET_IN_PAY_MODE':
      autoShowCollapsedWidgetIfSupportedMerchant(message.merchant);
      return;
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
    setTimeout(() => window.postMessage({ message: 'pairingOnly' }, process.env.API_ORIGIN as string), 300);
    window.addEventListener('message', ({ data }) => {
      const dataObj = typeof data === 'string' ? safelyParseJSON(data) : data;
      const { message, params } = dataObj || {};
      if (message !== 'pairing') return;
      browser.runtime.sendMessage(undefined, {
        name: 'ID_CONNECTED',
        data: params
      });
    });
  } else if (window.location.href.startsWith(`${process.env.API_ORIGIN}/extension`)) {
    const launchExtension = new URLSearchParams(window.location.search).get('launchExtension');
    if (launchExtension && !document.querySelector('iframe[srcdoc]')) toggleIframeVisibility();
  }
}

export {};
