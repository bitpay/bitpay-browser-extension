import { CardConfig } from './gift-card.types';
import { sortByDisplayName } from './gift-card';
import { removeProtocolAndWww } from './utils';
import { DirectIntegration } from './directory';

export interface Merchant extends DirectIntegration {
  name: string;
  featured?: boolean;
  hasDirectIntegration: boolean;
  giftCards: CardConfig[];
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
  directIntegrations: DirectIntegration[],
  availableGiftCardBrands: CardConfig[]
): Merchant[] {
  const directIntegrationMerchants = directIntegrations.map(integration => ({
    ...integration,
    logo: `https://marty.bp:8088/img/merchant-logos/${integration.logo}`,
    hasDirectIntegration: true,
    giftCards: []
  }));
  const giftCardMerchants = availableGiftCardBrands.map(cardConfig => ({
    hasDirectIntegration: false,
    name: cardConfig.name,
    displayName: cardConfig.displayName,
    caption: cardConfig.description,
    featured: cardConfig.featured,
    logo: cardConfig.icon,
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
