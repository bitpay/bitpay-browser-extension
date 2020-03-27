import { CardConfig } from './gift-card.types';
import { removeProtocolAndWww } from './utils';

export function getBitPayMerchantFromHost(host: string, merchants: CardConfig[]): CardConfig | undefined {
  const bareHost = host.replace(/^www\./, '');
  return merchants.find(config => removeProtocolAndWww(config.website).startsWith(bareHost));
}

export function isBitPayAccepted(host: string, merchants: CardConfig[]): boolean {
  return !!getBitPayMerchantFromHost(host, merchants);
}
