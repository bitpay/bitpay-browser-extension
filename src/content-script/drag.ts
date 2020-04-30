import { browser } from 'webextension-polyfill-ts';
import { FrameDimensions } from '../services/frame';

export function dragElementFunc(iframe: HTMLIFrameElement | undefined, dragEle: HTMLElement): void {
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
      if (bottomBound || topBound) {
        const left = leftBound || rightBound ? dragEle.style.left : newLeft;
        const top = bottomBound ? windowInnerHeight - rect.height - padding : 10;
        browser.runtime.sendMessage({
          name: 'RESET_FRAME_POSITION',
          top,
          left
        });
        dragEle.style.top = `${top}px`;
        dragEle.style.left = `${left}px`;
      }

      if (rightBound || leftBound) {
        const top = topBound || bottomBound ? dragEle.style.top : newTop;
        const left = rightBound ? dragEle.style.left : 10;
        browser.runtime.sendMessage({
          name: 'RESET_FRAME_POSITION',
          top,
          left
        });
        dragEle.style.top = `${top}px`;
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
    dragEle.style.cursor = 'grab';

    if (dragEle.style.left) {
      dragEle.style.left = `calc(${dragEle.style.left} + 75px)`;
    } else {
      dragEle.style.right = '75px';
    }

    if (iframe) {
      iframe.style.transform = 'translate3d(0px, 0px, 0px)';
      iframe.style.boxShadow = '0 0 14px 4px rgba(0,0,0,0.1)';
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
      dragEle.style.cursor = 'grabbing';
      iframe.style.transform = 'translate3d(0px, -2px, 0px) scale(1.01)';
      iframe.style.boxShadow = '0 2px 14px 8px rgba(0,0,0,0.08)';
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
