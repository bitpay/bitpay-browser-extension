const COPY_FAILED = new Error('Copy to Clipboard Failed!');

const zeroStyles = (i: HTMLInputElement, ...properties: string[]): void => {
  for (const property of properties) {
    i.style.setProperty(property, '0');
  }
};

const createInput = (): HTMLInputElement => {
  const i: HTMLInputElement = document.createElement('input');
  zeroStyles(i, 'border-width', 'outline-width', 'right', 'bottom', 'opacity');
  i.style.setProperty('position', 'absolute');
  i.style.setProperty('box-sizing', 'border-box');
  i.style.setProperty('outline-color', 'transparent');
  i.style.setProperty('background-color', 'transparent');
  i.style.setProperty('overflow', 'hidden');
  i.style.setProperty('margin', '0 0 0 0');
  i.style.setProperty('padding', '0 0 0 0');
  i.style.setProperty('height', '1px');
  i.style.setProperty('width', '1px');
  i.style.setProperty('max-height', '1px');
  i.style.setProperty('max-width', '1px');
  i.style.setProperty('min-height', '1px');
  i.style.setProperty('min-width', '1px');
  document.body.appendChild(i);
  return i;
};

const removeInput = (i: HTMLInputElement): void => {
  document.body.removeChild(i);
};

const write = (text: string): void => {
  const i = createInput();
  i.setAttribute('value', text);
  i.select();
  const success = document.execCommand('copy');
  removeInput(i);
  if (!success) {
    throw COPY_FAILED;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const copyUtil = (target: string): any => {
  async function writeClipboard(text: string): Promise<void> {
    try {
      write(text);
    } catch (e) {
      try {
        await navigator.clipboard.writeText(text);
      } catch (_e) {
        throw COPY_FAILED;
      }
    }
  }
  return writeClipboard(target);
};

export default copyUtil;
