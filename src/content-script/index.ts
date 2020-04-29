import { browser } from 'webextension-polyfill-ts';
import { FrameDimensions } from '../services/frame';
import { dispatchUrlChange } from '../services/browser';
import { Merchant } from '../services/merchant';
import { CheckoutPageCssSelectors } from '../services/gift-card.types';

let iframe: HTMLIFrameElement | undefined;
const DragElementId = 'BitPayExtensionDrag';

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
    box-shadow: 0 0 14px 4px rgba(0,0,0,0.1); 
    border-radius: 8px;
    z-index: ${FrameDimensions.zIndex};
    transition: height 250ms ease 0s;
  `;
  const dragElementStyles = `
    width: 160px; 
    height: ${FrameDimensions.collapsedHeight}px; 
    position: fixed;
    top: 10px;
    right: 75px;
    display: block;
    cursor: move;
    z-index: ${FrameDimensions.zIndex + 10};
   `;
  return { outerFrameStyles, innerFrameStyles, dragElementStyles };
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

// Extension Drag
function getDragElement(): HTMLElement | null {
  return document.getElementById(DragElementId);
}

function removeDragElement(): void {
  const el = getDragElement();
  if (el) {
    document.body.removeChild(el);
  }
}

function dragElementFunc(dragEle: HTMLElement): void {
  let pos1 = 0;
  let pos2 = 0;
  let pos3 = 0;
  let pos4 = 0;
  const windowInnerHeight = window.innerHeight;
  const windowInnerWidth = window.innerWidth;
  const padding = 10;
  let rect: ClientRect;
  const viewport = {
    bottom: 0,
    left: 0,
    right: 0,
    top: 0
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function elementDrag(e: any): void {
    // eslint-disable-next-line no-param-reassign
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    const newLeft = dragEle.offsetLeft - pos1;
    const newTop = dragEle.offsetTop - pos2;
    const leftBound = newLeft < viewport.left;
    const topBound = newTop < viewport.top;
    const rightBound = newLeft + rect.width > viewport.right;
    const bottomBound = newTop + rect.height > viewport.bottom;

    if (leftBound || topBound || rightBound || bottomBound) {
      if (bottomBound) {
        const left = leftBound || rightBound ? dragEle.style.left : newLeft;
        browser.runtime.sendMessage({
          name: 'RESET_FRAME_POSITION',
          top: windowInnerHeight - rect.height - padding,
          left
        });
        dragEle.style.top = `calc(${windowInnerHeight} - ${rect.height} - ${padding})px`;
        dragEle.style.left = `${left}px`;
      }
    } else {
      // set the element's new position:
      browser.runtime.sendMessage({ name: 'RESET_FRAME_POSITION', top: newTop, left: newLeft });
      dragEle.style.top = `${newTop}px`;
      dragEle.style.left = `${newLeft}px`;
    }
  }

  function closeDragElement(): void {
    dragEle.style.height = `${FrameDimensions.collapsedHeight}px`;
    dragEle.style.width = '160px';
    if (dragEle.style.left) {
      dragEle.style.left = `calc(${dragEle.style.left} + 75px)`;
    } else {
      dragEle.style.right = '75px';
    }
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function dragMouseDown(e: any): void {
    if (iframe) {
      dragEle.style.height = iframe.style.height;
      dragEle.style.width = iframe.style.width;
      dragEle.style.right = iframe.style.right;
      dragEle.style.left = iframe.style.left;
    }
    // eslint-disable-next-line no-param-reassign
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    rect = dragEle.getBoundingClientRect();
    viewport.bottom = windowInnerHeight - padding;
    viewport.left = padding;
    viewport.right = windowInnerWidth - padding;
    viewport.top = padding;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }
  dragEle.onmousedown = dragMouseDown;
}

function addDragElement(): void {
  const dragElement = document.createElement('div');
  const { dragElementStyles } = getIframeStyles();
  dragElement.style.cssText = dragElementStyles;
  dragElement.classList.add('drag-element');
  dragElement.setAttribute('id', DragElementId);
  document.body.appendChild(dragElement);

  const dragEle = getDragElement();
  if (dragEle) {
    dragElementFunc(dragEle);
  }
}

function resizeIframe(frame: HTMLIFrameElement, height: number = FrameDimensions.height): void {
  frame.style.height = `${height}px`;
}

function resetIframePosition(frame: HTMLIFrameElement, top: number, left: number): void {
  frame.style.top = `${top}px`;
  frame.style.left = `${left}px`;
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
      if (iframe) {
        removeDragElement();
        return removeIframe(iframe);
      }
      addIframe(createIframe({ merchant: message.merchant }));
      addDragElement();
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
    case 'RESET_FRAME_POSITION':
      return iframe && resetIframePosition(iframe, message.top, message.left);
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
