import track, { Options } from 'react-tracking';
import packageJson from '../../package.json';
import { get } from './storage';

let cachedAnalyticsClientId: string | undefined;

function getSafePathname(pathname: string): string {
  const parts = pathname.split('/');
  const invoiceIdIndex = 2;
  const safeParts = [...parts.slice(0, invoiceIdIndex), ...parts.slice(invoiceIdIndex + 1)];
  return pathname.startsWith('/card') ? `${safeParts.join('/')}` : pathname;
}

export function trackComponent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.FC<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eventProperties: any = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: Options<Partial<any>> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): React.FC<any> {
  return track(
    props => ({
      ...eventProperties,
      ...(props.location && props.location.pathname && { pathname: getSafePathname(props.location.pathname) })
    }),
    eventProperties.page ? { ...options, dispatchOnMount: true } : { ...options }
  )(component);
}
export async function sendEventToGa(event: { [key: string]: string }): Promise<void> {
  const clientId = cachedAnalyticsClientId || (await get<string>('analyticsClientId'));
  cachedAnalyticsClientId = clientId;
  const request = new XMLHttpRequest();
  const eventTypeAndData =
    event.action === 'viewedPage'
      ? `&t=pageview&dp=${event.pathname}&dt=${event.page}`
      : `&t=event&ea=${event.gaAction || event.action}`;
  const message = `v=1&tid=${process.env.GA_UA}&cid=${clientId}&aip=1&ds=add-on&ec=${packageJson.version}${eventTypeAndData}`;

  request.open('POST', 'https://www.google-analytics.com/collect', true);
  request.send(message);
}

export function dispatchEvent(event: { [key: string]: string }): void {
  if (process.env.TARGET_BROWSER === 'firefox') return;
  sendEventToGa(event);
}
