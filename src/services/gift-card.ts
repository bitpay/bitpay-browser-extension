import {
  ApiCardConfig,
  AvailableCardMap,
  CardConfig,
  GiftCard,
  GiftCardActivationFee,
  ApiCard,
  GiftCardInvoiceParams,
  GiftCardOrder,
  Invoice,
  GiftCardDiscount,
  GiftCardBalanceEntry
} from './gift-card.types';
import { post } from './utils';
import { getPrecision } from './currency';

function getCardConfigFromApiBrandConfig(cardName: string, apiBrandConfig: ApiCardConfig): CardConfig {
  const cards = apiBrandConfig;
  const [firstCard] = cards;
  const { currency } = firstCard;
  const range = cards.find(c => !!(c.maxAmount || c.minAmount) && c.currency === currency) as ApiCard;
  const fixed = cards.filter(c => c.amount && c.currency);
  const supportedAmounts = fixed
    .reduce((newSupportedAmounts, currentCard) => {
      const curAmount = currentCard.amount as number;
      return [...newSupportedAmounts, curAmount];
    }, [] as number[])
    .sort((a: number, b: number) => a - b);

  const activationFees = cards
    .filter(c => c.activationFees)
    .reduce((allFees, card) => [...allFees, ...(card.activationFees || [])], [] as GiftCardActivationFee[]);

  const { amount, type, maxAmount, minAmount, website, ...config } = firstCard;
  const baseConfig = { ...config, name: cardName, activationFees, website: website || '' };
  const rangeMin = range && (range.minAmount as number);
  return range
    ? {
        ...baseConfig,
        minAmount: rangeMin < 1 ? 1 : range.minAmount,
        maxAmount: range.maxAmount
      }
    : { ...baseConfig, supportedAmounts };
}

function getDisplayNameSortValue(displayName: string): string {
  const startsNumeric = (value: string): boolean => /^[0-9]$/.test(value.charAt(0));
  const name = displayName.toLowerCase();
  return `${startsNumeric(name) ? 'zzz' : ''}${name}`;
}
export function sortByDisplayName(a: { displayName: string }, b: { displayName: string }): 1 | -1 {
  const aSortValue = getDisplayNameSortValue(a.displayName);
  const bSortValue = getDisplayNameSortValue(b.displayName);
  return aSortValue > bSortValue ? 1 : -1;
}

function fetchPublicAvailableCardMap(): Promise<AvailableCardMap> {
  const url = `${process.env.API_ORIGIN}/gift-cards/cards`;
  return fetch(url).then(res => res.json());
}

async function fetchAvailableCardMap(): Promise<AvailableCardMap> {
  const availableCardMap = await fetchPublicAvailableCardMap();
  return availableCardMap;
}

function removeDiscountsForNow(cardConfig: CardConfig): CardConfig {
  return {
    ...cardConfig,
    discounts: undefined
  };
}

function getCardConfigFromApiConfigMap(availableCardMap: AvailableCardMap): CardConfig[] {
  const cardNames = Object.keys(availableCardMap);
  const availableCards = cardNames
    .filter(cardName => availableCardMap[cardName] && availableCardMap[cardName].length)
    .map(cardName => getCardConfigFromApiBrandConfig(cardName, availableCardMap[cardName]))
    .filter(config => !config.hidden)
    .map(cardConfig => removeDiscountsForNow(cardConfig))
    .map(cardConfig => ({
      ...cardConfig,
      displayName: cardConfig.displayName || cardConfig.name
    }))
    .sort(sortByDisplayName);
  return availableCards;
}

export async function createBitPayInvoice(params: GiftCardInvoiceParams): Promise<GiftCardOrder> {
  const url = `${process.env.API_ORIGIN}/gift-cards/pay`;
  return post(url, params);
}

export async function redeemGiftCard(data: Partial<GiftCard>): Promise<GiftCard> {
  const url = `${process.env.API_ORIGIN}/gift-cards/redeem`;
  const params = {
    clientId: data.clientId,
    invoiceId: data.invoiceId,
    accessKey: data.accessKey
  };
  const giftCard = await post(url, params)
    .then((res: { claimCode?: string; claimLink?: string; pin?: string; barcodeImage?: string }) => {
      const status = res.claimCode || res.claimLink ? 'SUCCESS' : 'PENDING';
      const fullCard = {
        ...data,
        ...res,
        status
      };
      return fullCard;
    })
    .catch(err => {
      const errMessage = err.message || (err.error && err.error.message);
      const pendingMessages = ['Card creation delayed', 'Invoice is unpaid or payment has not confirmed'];
      const isDelayed = pendingMessages.includes(errMessage) || errMessage.indexOf('Please wait') !== -1;
      return { ...data, status: isDelayed ? 'PENDING' : 'FAILURE' };
    });
  return giftCard as GiftCard;
}

export async function getBitPayInvoice(id: string): Promise<Invoice> {
  const { data } = await fetch(`${process.env.API_ORIGIN}/invoices/${id}`).then(res => res.json());
  return data;
}

export function fetchAvailableCards(): Promise<CardConfig[]> {
  return fetchAvailableCardMap().then(availableCardMap => getCardConfigFromApiConfigMap(availableCardMap));
}

export function sortByDescendingDate(a: { date: Date | string }, b: { date: Date | string }): 1 | -1 {
  return new Date(a.date) < new Date(b.date) ? 1 : -1;
}

export function getCardPrecision(cardConfig: CardConfig): number {
  return cardConfig.integersOnly ? 0 : getPrecision(cardConfig.currency);
}

export function getActivationFee(amount: number, cardConfig: CardConfig): number {
  const activationFees = (cardConfig && cardConfig.activationFees) || [];
  const fixedFee = activationFees.find(
    fee => fee.type === 'fixed' && amount >= fee.amountRange.min && amount <= fee.amountRange.max
  );
  return (fixedFee && fixedFee.fee) || 0;
}

export const getDiscountAmount = (amount: number, discount: GiftCardDiscount): number =>
  discount.type === 'percentage' ? (discount.amount / 100) * amount : discount.amount;

export const getTotalDiscount = (amount: number, discounts: GiftCardDiscount[] = []): number =>
  discounts.reduce((sum, discount) => sum + getDiscountAmount(amount, discount), 0);

export const getLatestBalanceEntry = (card: GiftCard): GiftCardBalanceEntry =>
  (card.balanceHistory || []).sort(sortByDescendingDate)[0] || { date: card.date, amount: card.amount };

export const getLatestBalance = (card: GiftCard): number => getLatestBalanceEntry(card).amount;
