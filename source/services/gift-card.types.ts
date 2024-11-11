export enum ClaimCodeType {
  barcode = 'barcode',
  code = 'code',
  link = 'link'
}

export interface CheckoutPageCssSelectors {
  orderTotal: string[];
  claimCodeInput: string[];
  pinInput: string[];
}

export interface GiftCardDiscount {
  code: string;
  hidden?: boolean;
  type: 'flatrate' | 'percentage';
  amount: number;
}

export interface GiftCardCoupon extends GiftCardDiscount {
  code: string;
  displayType: 'boost' | 'discount';
  type: 'flatrate' | 'percentage';
  amount: number;
}

export interface GiftCardActivationFee {
  amountRange: {
    min: number;
    max: number;
  };
  fee: number;
  type: 'fixed' | 'percentage';
}

export interface CommonCardConfig {
  activationFees?: GiftCardActivationFee[];
  allowedPhoneCountries?: string[];
  brandColor?: string;
  cardImage: string;
  cssSelectors?: CheckoutPageCssSelectors;
  currency: string;
  defaultClaimCodeType: ClaimCodeType;
  description: string;
  discounts?: GiftCardDiscount[];
  coupons?: GiftCardCoupon[];
  displayName: string;
  emailRequired: boolean;
  featured?: boolean;
  hidden?: boolean;
  hidePin?: boolean;
  icon: string;
  integersOnly?: boolean;
  logo: string;
  logoBackgroundColor: string;
  minAmount?: number;
  maxAmount?: number;
  mobilePaymentsSupported?: boolean;
  phoneRequired?: boolean;
  printRequired?: boolean;
  redeemButtonText?: string;
  redeemInstructions?: string;
  redeemUrl?: string;
  supportedUrls?: string[];
  terms: string;
  website: string;
  tags?: string[];
}

export interface CardConfig extends CommonCardConfig {
  name: string;
  supportedAmounts?: number[];
}

export interface UnsoldGiftCard {
  amount: number;
  currency: string;
  name: string;
  coupons?: GiftCardCoupon[];
}

export interface GiftCardBalanceEntry {
  date: string;
  amount: number;
}

export interface GiftCard extends UnsoldGiftCard {
  accessKey: string;
  archived: boolean;
  barcodeData?: string;
  barcodeFormat?: string;
  barcodeImage?: string;
  claimCode: string;
  claimLink?: string;
  date: string;
  discounts?: GiftCardDiscount[];
  displayName: string;
  invoiceId: string;
  pin?: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILURE' | 'UNREDEEMED' | 'SYNCED';
  clientId: string;
  totalDiscount?: number;
  balanceHistory?: GiftCardBalanceEntry[];
  invoice: Invoice;
  userEid?: string;
}

export type GiftCardSaveParams = Partial<{
  error: string;
  status: string;
  remove: boolean;
}>;

export interface ApiCard extends CommonCardConfig {
  amount?: number;
  type: 'fixed' | 'range';
}

export interface GiftCardInvoiceParams {
  brand: string;
  currency: string;
  amount: number;
  clientId: string;
  discounts?: string[];
  coupons?: string[];
  email?: string;
  phone?: string;
}

export interface GiftCardOrder {
  accessKey: string;
  invoiceId: string;
  totalDiscount: number;
}

export interface GiftCardRedeemParams {
  accessKey: string;
  clientId: string;
  invoiceId: string;
}

export interface GiftCardInvoiceMessage {
  data: { status: 'closed' | 'paid' | 'confirmed' | 'complete' };
}

export type ApiCardConfig = ApiCard[];

export interface AvailableCardMap {
  [cardName: string]: ApiCardConfig;
}

export interface CardConfigMap {
  [cardName: string]: CardConfig;
}

export interface Invoice {
  url: string;
  paymentTotals: { [currency: string]: number };
  paymentDisplayTotals: { [currency: string]: string };
  amountPaid: number;
  displayAmountPaid: string;
  nonPayProPaymentReceived?: boolean;
  transactionCurrency: string;
  status: 'new' | 'paid' | 'confirmed' | 'complete' | 'expired' | 'invalid';
}

export interface PhoneCountryInfo {
  phoneCountryCode: string;
  countryIsoCode: string;
}
