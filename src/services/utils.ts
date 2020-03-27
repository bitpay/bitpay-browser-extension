export function removeProtocolAndWww(url: string): string {
  return url.replace(/(^\w+:|^)\/\//, '').replace(/^www\./, '');
}
