import React from 'react';
import { shallow } from 'enzyme';
import WalletCard from './wallet-card';
import { CardConfig, ClaimCodeType, GiftCard } from '../../../services/gift-card.types';

const Cards: GiftCard[] = [
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

const CardConfigValue: CardConfig = {
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

const GetBalanceReturnValue = 5;

jest.mock('../../../services/gift-card', () => ({
  getLatestBalance: (): number => GetBalanceReturnValue
}));

describe('Wallet Card', () => {
  it('should create the component', () => {
    const wrapper = shallow(<WalletCard cards={Cards} cardConfig={CardConfigValue} type="pocket" />);
    expect(wrapper.exists()).toBeTruthy();
  });

  it('should return pocket card for type=pocket', () => {
    const expectedCardLogoValues = {
      src: CardConfigValue.logo,
      alt: `${CardConfigValue.displayName} logo`
    };
    const wrapper = shallow(<WalletCard cards={Cards} cardConfig={CardConfigValue} type="pocket" />);
    const cardLogoImg = wrapper.find('#pocketCardLogo');
    expect(cardLogoImg.prop('src')).toBe(expectedCardLogoValues.src);
    expect(cardLogoImg.prop('alt')).toBe(expectedCardLogoValues.alt);
    expect(wrapper.find('.wallet-card__card__balance').text()).toBe(`$${GetBalanceReturnValue}`);
  });

  it('should return brand box card for type=brand-box', () => {
    const expectedCardLogoValues = {
      src: CardConfigValue.logo,
      alt: `${CardConfigValue.displayName} logo`
    };
    const wrapper = shallow(<WalletCard cards={Cards} cardConfig={CardConfigValue} type="brand-box" />);
    expect(wrapper.find('#pocketCardLogo').exists()).toBeFalsy();

    const cardLogoImg = wrapper.find('#brandBoxCardLogo');
    expect(cardLogoImg.prop('src')).toBe(expectedCardLogoValues.src);
    expect(cardLogoImg.prop('alt')).toBe(expectedCardLogoValues.alt);
    expect(wrapper.find('.wallet-card--brand-box__balance').text()).toBe(`$${GetBalanceReturnValue}`);
    expect(wrapper.find('.wallet-card--card-box__text').exists()).toBeFalsy();
  });

  it('should return CardBox for type=card-box', () => {
    const wrapper = shallow(<WalletCard cards={Cards} cardConfig={CardConfigValue} type="card-box" />);
    expect(wrapper.find('#pocketCardLogo').exists()).toBeFalsy();
    expect(wrapper.find('#brandBoxCardLogo').exists()).toBeFalsy();
    expect(wrapper.find('.wallet-card--card-box__text__label').text()).toBe('Gift Card');
    expect(wrapper.find('.wallet-card--card-box__text__note').text()).toBe('Purchased 4/23/20');
    expect(wrapper.find('.wallet-card--card-box__balance').text()).toBe(`$${GetBalanceReturnValue}`);
  });
});
