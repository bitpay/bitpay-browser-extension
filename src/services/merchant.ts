import { CardConfig } from './gift-card.types';
import { sortByDisplayName, fetchAvailableCards, addToSupportedGiftCards } from './gift-card';
import { removeProtocolAndWww } from './utils';
import { DirectIntegration, fetchDirectIntegrations, fetchDirectory, Directory } from './directory';
import { get, set } from './storage';
import { currencySymbols } from './currency';
import { BitpayUser } from './bitpay-id';

export interface Merchant extends DirectIntegration {
  name: string;
  featured?: boolean;
  hasDirectIntegration: boolean;
  giftCards: CardConfig[];
}

export interface InitialEntry {
  pathname: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: any;
}

export function spreadAmounts(values: Array<number>, currency: string): string {
  const currencySymbol = currencySymbols[currency];
  let caption = '';
  values.forEach((value: number, index: number) => {
    caption = currencySymbol
      ? caption + currencySymbol + value.toString()
      : `${caption + value.toString()} ${currency}`;
    if (values.length - index >= 2) {
      caption += ', ';
    }
  });
  return caption;
}

export function formatDiscount(
  discount: { type: string; amount: number; currency?: string },
  currency?: string
): string {
  if (discount.type === 'percentage') {
    return `${discount.amount.toString()}%`;
  }
  if (discount.type === 'flatrate' && currency) {
    return currencySymbols[currency]
      ? `${currencySymbols[currency]}${discount.amount.toString()}`
      : `${discount.amount.toString()} ${currency}`;
  }
  return discount.amount.toString();
}

export function doesUrlMatch(url: string, supportedUrl: string): boolean {
  const urlWithoutProtocol = removeProtocolAndWww(supportedUrl);
  const regExp = new RegExp(
    `(https?:\\/\\/(.+?\\.)?${urlWithoutProtocol}(\\/[A-Za-z0-9\\-\\._~:\\/\\?#\\[\\]@!$&'\\(\\)\\*\\+,;\\=]*)?)`,
    'g'
  );
  return !!supportedUrl && regExp.test(url);
}

export function doAnyUrlsMatch(url: string, supportedUrls: string[]): boolean {
  return supportedUrls.some(supportedUrl => doesUrlMatch(url, supportedUrl));
}

export function getBitPayMerchantFromUrl(url: string, merchants: Merchant[]): Merchant | undefined {
  return merchants.find(merchant => doAnyUrlsMatch(url, merchant.domains));
}

export function isBitPayAccepted(url: string, merchants: Merchant[]): boolean {
  return !!getBitPayMerchantFromUrl(url, merchants);
}

export function getMerchants(
  directIntegrations: DirectIntegration[] = [],
  availableGiftCardBrands: CardConfig[] = []
): Merchant[] {
  const directIntegrationMerchants = directIntegrations.map(integration => ({
    ...integration,
    hasDirectIntegration: true,
    giftCards: []
  }));
  const giftCardMerchants = availableGiftCardBrands.map(cardConfig => ({
    hasDirectIntegration: false,
    name: cardConfig.name,
    displayName: cardConfig.displayName,
    caption: cardConfig.description,
    featured: cardConfig.featured,
    icon: cardConfig.icon,
    link: cardConfig.website,
    displayLink: cardConfig.website,
    tags: cardConfig.tags || [],
    domains: [cardConfig.website].concat(cardConfig.supportedUrls || []),
    theme: cardConfig.brandColor || cardConfig.logoBackgroundColor,
    instructions: cardConfig.description,
    giftCards: [cardConfig]
  }));
  return [...directIntegrationMerchants, ...giftCardMerchants].sort(sortByDisplayName);
}

export async function fetchCachedMerchants(): Promise<Merchant[]> {
  const [directIntegrations, availableGiftCardBrands] = await Promise.all([
    get<DirectIntegration[]>('directIntegrations'),
    get<CardConfig[]>('availableGiftCards')
  ]);
  return getMerchants(directIntegrations, availableGiftCardBrands);
}

export async function fetchMerchants(): Promise<Merchant[]> {
  const user = await get<BitpayUser>('bitpayUser');
  const [directory, directIntegrations, availableGiftCards, supportedGiftCards = []] = await Promise.all([
    fetchDirectory().catch(() => ({ curated: {}, categories: {} } as Directory)),
    fetchDirectIntegrations().catch(() => []),
    fetchAvailableCards({ user }).catch(() => []),
    get<CardConfig[]>('supportedGiftCards')
  ]);
  const newSupportedGiftCards = addToSupportedGiftCards(supportedGiftCards, availableGiftCards);
  await Promise.all([
    set<Directory>('directory', directory),
    set<DirectIntegration[]>('directIntegrations', directIntegrations),
    set<CardConfig[]>('availableGiftCards', availableGiftCards),
    set<CardConfig[]>('supportedGiftCards', newSupportedGiftCards)
  ]);
  return getMerchants(directIntegrations, availableGiftCards);
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function getDiscount(merchant: Merchant) {
  const cardConfig = merchant.giftCards[0];
  return merchant.discount || (cardConfig && cardConfig.discounts && cardConfig.discounts[0]);
}

export const getDirectIntegrationInitialEntries = (merchant: Merchant): InitialEntry[] => [
  { pathname: '/shop', state: {} },
  { pathname: `/brand/${merchant.name}`, state: { merchant } }
];

export const getMerchantInitialEntries = ({
  merchant,
  orderTotal,
  extensionClientId,
  bitpayUser,
  receiptEmail
}: {
  merchant?: Merchant;
  extensionClientId: string;
  orderTotal?: number;
  bitpayUser?: BitpayUser;
  receiptEmail?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): InitialEntry[] => {
  if (merchant && merchant.hasDirectIntegration) return getDirectIntegrationInitialEntries(merchant);
  const cardConfig = merchant?.giftCards[0];
  // eslint-disable-next-line no-nested-ternary
  const pathname = orderTotal
    ? cardConfig?.discounts
      ? `/payment/${merchant?.name}`
      : `/amount/${merchant?.name}`
    : merchant
    ? `/wallet`
    : '/shop';
  const state = orderTotal
    ? {
        cardConfig,
        merchant,
        amount: orderTotal,
        invoiceParams: {
          brand: cardConfig?.name,
          currency: cardConfig?.currency,
          amount: orderTotal,
          clientId: extensionClientId,
          discounts: cardConfig?.discounts ? [cardConfig.discounts[0].code] : [],
          email: (bitpayUser && bitpayUser.email) || receiptEmail
        }
      }
    : {};
  const entries = orderTotal
    ? [
        { pathname: '/wallet', state },
        ...(cardConfig?.discounts ? [{ pathname: `/amount/${merchant?.name}`, state }] : []),
        { pathname, state }
      ]
    : [{ pathname, state }];
  return entries;
};
