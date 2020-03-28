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
  const data = await response.json();
  return data;
}
