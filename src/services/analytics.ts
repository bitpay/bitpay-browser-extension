import track, { Options } from 'react-tracking';
import ReactGA from 'react-ga';
import { dispatchAnalyticsEvent } from './browser';
import packageJson from '../../package.json';

ReactGA.initialize(process.env.GA_UA as string, {
  gaAddress: 'https://www.google-analytics.com/analytics.js',
  titleCase: false
});
ReactGA.ga('set', 'checkProtocolTask', null);

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

export function dispatchEvent(event: { [key: string]: string }): void {
  dispatchAnalyticsEvent(event);
}

export function sendEventToGa(event: { [key: string]: string }): void {
  event.action === 'viewedPage'
    ? ReactGA.pageview(event.pathname, undefined, event.page)
    : ReactGA.event({ category: packageJson.version, action: event.gaAction || event.action });
}
