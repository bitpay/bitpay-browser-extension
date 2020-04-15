import { CardConfig } from './gift-card.types';
import { sortByDisplayName, fetchAvailableCards, addToSupportedGiftCards } from './gift-card';
import { removeProtocolAndWww } from './utils';
import { DirectIntegration, fetchDirectIntegrations } from './directory';
import { get, set } from './storage';
import { currencySymbols } from './currency';
import { BitpayUser } from './bitpay-id';

export interface Merchant extends DirectIntegration {
  name: string;
  featured?: boolean;
  hasDirectIntegration: boolean;
  giftCards: CardConfig[];
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

export function getBitPayMerchantFromHost(host: string, merchants: Merchant[]): Merchant | undefined {
  const bareHost = host.replace(/^www\./, '');
  const hasDomainMatch = (domains: string[] = []): boolean =>
    domains.some(domain => removeProtocolAndWww(domain).startsWith(bareHost));
  return merchants.find(merchant => hasDomainMatch(merchant.domains));
}

export function isBitPayAccepted(host: string, merchants: Merchant[]): boolean {
  return !!getBitPayMerchantFromHost(host, merchants);
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
    tags: [],
    domains: [cardConfig.website],
    theme: cardConfig.logoBackgroundColor,
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
  const [directIntegrations, availableGiftCards, supportedGiftCards = []] = await Promise.all([
    fetchDirectIntegrations().catch(() => []),
    fetchAvailableCards({ user }).catch(() => []),
    get<CardConfig[]>('supportedGiftCards')
  ]);
  const newSupportedGiftCards = addToSupportedGiftCards(supportedGiftCards, availableGiftCards);
  await Promise.all([
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
