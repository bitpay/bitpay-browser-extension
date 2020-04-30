import { CardConfig, ClaimCodeType, GiftCard } from '../../../../services/gift-card.types';

export const GiftCardsData: GiftCard[] = [
  {
    accessKey: '5664461f4ec3a5',
    archived: false,
    claimCode: 'ABCD-EFGH-IJKL',
    clientId: 'abcdef123-1234-abc3-abca-795e030dce9a',
    currency: 'USD',
    date: '2020-04-23T22:57:05.298Z',
    invoiceId: 'BCZVk7Bk8Zwk6maEAzK123',
    name: 'Amazon.com',
    status: 'SUCCESS',
    amount: 1,
    displayName: 'Amazon',
    invoice: {
      url: 'https://bitpay.com/invoice?id=BCZVk7Bk8Zwk6maEAzK123',
      paymentTotals: {
        BCH: 414900,
        BTC: 13300,
        ETH: 5286000000000000,
        GUSD: 100,
        PAX: 1000000000000000000,
        USDC: 1000000,
        XRP: 5127416
      },
      paymentDisplayTotals: {
        BCH: '0.004149',
        BTC: '0.000133',
        ETH: '0.005286',
        GUSD: '1.00',
        PAX: '1.00',
        USDC: '1.00',
        XRP: '5.127416'
      },
      amountPaid: 13300,
      displayAmountPaid: '0.000133',
      transactionCurrency: 'BTC',
      status: 'confirmed'
    }
  }
];

export const CardConfigData: CardConfig = {
  name: 'Amazon.com',
  activationFees: [],
  brandColor: '#FF9902',
  cardImage: 'https://bitpay.com/gift-cards/assets/amazoncom/card2.png',
  currency: 'USD',
  defaultClaimCodeType: ClaimCodeType.code,
  displayName: 'Amazon',
  emailRequired: true,
  featured: true,
  icon: 'https://bitpay.com/gift-cards/assets/amazoncom/icon2.svg',
  logo: 'https://bitpay.com/gift-cards/assets/amazoncom/logo.svg',
  logoBackgroundColor: '#363636',
  maxAmount: 2000,
  minAmount: 1,
  redeemUrl: 'https://www.amazon.com/gc/redeem?claimCode=abc',
  terms: 'Amazon.com is not a sponsor of this promotion. Except as required by law, Amazon.com Gift Card',
  website: 'amazon.com',
  description: 'card description',
  cssSelectors: {
    claimCodeInput: ['.pmts-claim-code', '#spc-gcpromoinput'],
    orderTotal: ['.grand-total-price'],
    pinInput: []
  }
};
