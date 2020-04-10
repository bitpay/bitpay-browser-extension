import { useState, useEffect } from 'react';

export function removeProtocolAndWww(url: string): string {
  return url.replace(/(^\w+:|^)\/\//, '').replace(/^www\./, '');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function post(url: string, params: any): Promise<any> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });
  if (!response.ok) {
    const err = await response.json();
    throw Error(err.message);
  }
  const data = await response.json();
  return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function groupBy(list: any[], props: any): {} {
  return list.reduce((a, b) => {
    (a[b[props]] = a[b[props]] || []).push(b);
    return a;
  }, {});
}

export const wait = (ms: number): Promise<void> => new Promise(_ => setTimeout(_, ms));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useKeyPress(targetKey: string): any {
  // State for keeping track of whether key is pressed
  const [keyPressed, setKeyPressed] = useState(false);

  // If pressed key is our target key then set to true
  function downHandler({ key }: { key: string }): void {
    if (key === targetKey) {
      setKeyPressed(true);
    }
  }

  // If released key is our target key then set to false
  const upHandler = ({ key }: { key: string }): void => {
    if (key === targetKey) {
      setKeyPressed(false);
    }
  };

  // Add event listeners
  useEffect(() => {
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);
    // Remove event listeners on cleanup
    return (): void => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return keyPressed;
}
