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
  GiftCardBalanceEntry,
  CardConfigMap,
  GiftCardCoupon
} from './gift-card.types';
import { post } from './utils';
import { getPrecision } from './currency';
import { BitpayUser, apiCall } from './bitpay-id';

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
  const baseConfig = {
    ...config,
    name: cardName,
    activationFees,
    website: website || ''
  };
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

async function fetchAvailableCardMap({
  country,
  user
}: {
  country: string;
  user: BitpayUser;
}): Promise<AvailableCardMap> {
  const incentiveLevelId = (user && user.syncGiftCards && user.incentiveLevelId) || '';
  const url = `${process.env.API_ORIGIN}/gift-cards/catalog/${country || 'US'}${
    incentiveLevelId ? `/${incentiveLevelId}` : ''
  }`;
  const availableCardMap = await fetch(url).then(res => res.json());
  return availableCardMap;
}

function getCardConfigFromApiConfigMap(availableCardMap: AvailableCardMap): CardConfig[] {
  const cardNames = Object.keys(availableCardMap);
  const availableCards = cardNames
    .filter(cardName => availableCardMap[cardName] && availableCardMap[cardName].length)
    .map(cardName => getCardConfigFromApiBrandConfig(cardName, availableCardMap[cardName]))
    .filter(config => !config.hidden)
    .map(cardConfig => ({
      ...cardConfig,
      displayName: cardConfig.displayName || cardConfig.name
    }))
    .sort(sortByDisplayName);
  return availableCards;
}

export async function getCountry(): Promise<string> {
  const { country } = await fetch(`${process.env.API_ORIGIN}/wallet-card/location`)
    .then(res => res.json())
    .catch(() => 'US');
  return country;
}

export async function createBitPayInvoice({
  params,
  user
}: {
  params: GiftCardInvoiceParams;
  user?: BitpayUser;
}): Promise<GiftCardOrder> {
  const finalParams = { ...params, pluginInfo: 'BitPay Extension' };
  return user && user.syncGiftCards
    ? apiCall(user.token, 'createGiftCardInvoice', finalParams)
    : post(`${process.env.API_ORIGIN}/gift-cards/pay`, finalParams);
}

export async function getBitPayInvoice(id: string): Promise<Invoice> {
  const { data } = await fetch(`${process.env.API_ORIGIN}/invoices/${id}`).then(res => res.json());
  return data;
}

export async function redeemGiftCard(data: Partial<GiftCard>): Promise<GiftCard> {
  const url = `${process.env.API_ORIGIN}/gift-cards/redeem`;
  const params = {
    clientId: data.clientId,
    invoiceId: data.invoiceId,
    accessKey: data.accessKey
  };
  const invoice = await getBitPayInvoice(data.invoiceId as string).catch(() => data.invoice);
  const giftCard = await post(url, params)
    .then((res: { claimCode?: string; claimLink?: string; pin?: string; barcodeImage?: string }) => {
      const status = res.claimCode || res.claimLink ? 'SUCCESS' : 'PENDING';
      const fullCard = {
        ...data,
        ...res,
        invoice,
        status
      };
      return fullCard;
    })
    .catch(err => {
      const errMessage = err.message || (err.error && err.error.message);
      const pendingMessages = ['Card creation delayed', 'Invoice is unpaid or payment has not confirmed'];
      const invoiceStatus = invoice?.status as string;
      const hasValidPayment = ['paid', 'confirmed', 'complete'].includes(invoiceStatus);
      const isDelayed = pendingMessages.includes(errMessage) || errMessage.indexOf('Please wait') !== -1;
      return {
        ...data,
        invoice,
        status: isDelayed && hasValidPayment ? 'PENDING' : 'FAILURE'
      };
    });
  return giftCard as GiftCard;
}

export function fetchAvailableCards(params: { user: BitpayUser; country: string }): Promise<CardConfig[]> {
  return fetchAvailableCardMap(params).then(availableCardMap => getCardConfigFromApiConfigMap(availableCardMap));
}

export function addToSupportedGiftCards(
  supportedGiftCards: CardConfig[],
  availableGiftCards: CardConfig[]
): CardConfig[] {
  const combinedGiftCards = supportedGiftCards.concat(availableGiftCards);
  const giftCardsMappedByName = new Map(combinedGiftCards.map(config => [config.name, config]));
  return Array.from(giftCardsMappedByName.values());
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

export function isAmountValid(amount: number, cardConfig: CardConfig): boolean {
  const maxAmount = cardConfig.maxAmount as number;
  const minAmount = cardConfig.minAmount as number;
  return cardConfig.supportedAmounts ? true : amount <= maxAmount && amount >= minAmount;
}

export function isSupportedCouponType(coupon: GiftCardCoupon): boolean {
  return (
    ['percentage', 'flatrate'].includes(coupon.type) &&
    ['boost', 'discount'].includes(coupon.displayType)
  );
}

export function getVisibleCoupon(cardConfig: CardConfig): GiftCardCoupon | undefined {
  const coupons = cardConfig && cardConfig.coupons;
  return coupons && coupons.find(c => isSupportedCouponType(c) && !c.hidden);
}

export function hasVisibleBoost(cardConfig: CardConfig): boolean {
  const coupon = getVisibleCoupon(cardConfig);
  return !!(coupon && coupon.displayType === 'boost');
}

export function hasVisibleDiscount(cardConfig: CardConfig): boolean {
  const coupon = getVisibleCoupon(cardConfig);
  return !!(coupon && coupon.displayType === 'discount');
}

export function getBoostPercentage(couponAmount: number): number {
  const couponPercentage = couponAmount / 100;
  const displayBoostPercentage = couponPercentage / (1 - couponPercentage);
  return displayBoostPercentage;
}

export function getDisplayableBoostPercentage(percentage: number): number {
  return parseFloat((getBoostPercentage(percentage!) * 100).toFixed(1));
}

export function getMaxAmountWithBoost(cardConfig: CardConfig): number | undefined {
  const { maxAmount } = cardConfig;
  if (!maxAmount) {
    return undefined;
  }
  const coupon = getVisibleCoupon(cardConfig);
  if (!coupon || coupon.displayType !== 'boost') {
    return maxAmount;
  }
  if (coupon.type === 'percentage') {
    return maxAmount * (1 - (coupon.amount / 100));
  }
  return maxAmount - coupon.amount;
}

export function getBoostAmount(cardConfig: CardConfig, enteredAmount: number): number {
  const coupon = getVisibleCoupon(cardConfig);
  if (!coupon || coupon.displayType !== 'boost') {
    return 0;
  }
  return coupon.type === 'percentage'
    ? enteredAmount * getBoostPercentage(coupon.amount)
    : coupon.amount;
}

export function getBoostedAmount(
  cardConfig: CardConfig,
  enteredAmount: number
): number {
  if (!enteredAmount) {
    return 0;
  }
  const boostedAmount =
    enteredAmount + getBoostAmount(cardConfig, enteredAmount);
  return boostedAmount;
}

export const getDiscountAmount = (amount: number, discount: GiftCardDiscount): number =>
  discount.type === 'percentage' ? (discount.amount / 100) * amount : discount.amount;

export const getTotalDiscount = (amount: number, discounts: GiftCardDiscount[] = []): number =>
  discounts.slice(0, 1).reduce((sum, discount) => sum + getDiscountAmount(amount, discount), 0);

export const getLatestBalanceEntry = (card: GiftCard): GiftCardBalanceEntry =>
  (card.balanceHistory || []).sort(sortByDescendingDate)[0] || {
    date: card.date,
    amount: card.amount
  };

export const getLatestBalance = (card: GiftCard): number => getLatestBalanceEntry(card).amount;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function getGiftCardPromoEventParams(promotedCard: CardConfig) {
  const coupon = getVisibleCoupon(promotedCard)!;
  return {
    brand: promotedCard.name,
    promoName: coupon.code,
    promoType: coupon.type,
    discountAmount: coupon.amount
  };
}

export const getCardConfigMap = (cardConfigList: CardConfig[]): CardConfigMap =>
  cardConfigList.reduce(
    (map, cardConfig) => ({ ...map, ...{ [cardConfig.name]: cardConfig } }),
    {} as { [name: string]: CardConfig }
  );
