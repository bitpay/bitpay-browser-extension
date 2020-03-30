import { browser } from 'webextension-polyfill-ts';

export enum FrameDimensions {
  collapsedHeight = '47px',
  height = '350px',
  shopTabHeight = '529px',
  width = '300px'
}

export const resizeFrame = (height: string): void => {
  browser.runtime.sendMessage({ name: `POPUP_RESIZED:${height}` });
};

export const getFrameHeightForPath = (path: string): string =>
  path === '/shop' ? FrameDimensions.shopTabHeight : FrameDimensions.height;

export const resizeFrameForPath = (path: string): void => {
  resizeFrame(getFrameHeightForPath(path));
};
