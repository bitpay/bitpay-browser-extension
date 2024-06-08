import { browser } from 'webextension-polyfill-ts';

export enum FrameDimensions {
  amountPageHeight = 360,
  collapsedHeight = 47,
  height = 350,
  width = 300,
  maxFrameHeight = 600,
  minExpandedFrameHeight = 200,
  zIndex = 2147483647
}

export const resizeFrame = (height: number): void => {
  browser.runtime.sendMessage({ name: `POPUP_RESIZED`, height });
};

export const resizeToFitPage = (ref: React.RefObject<HTMLDivElement>, padding = 0, delay = 10): void => {
  setTimeout(() => {
    const fullHeight = ref.current ? ref.current.scrollHeight + padding : FrameDimensions.minExpandedFrameHeight;
    const height =
      // eslint-disable-next-line no-nested-ternary
      fullHeight < FrameDimensions.minExpandedFrameHeight
        ? FrameDimensions.minExpandedFrameHeight
        : fullHeight > FrameDimensions.maxFrameHeight
        ? FrameDimensions.maxFrameHeight
        : fullHeight;
    resizeFrame(height);
  }, delay);
};
