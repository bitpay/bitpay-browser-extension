import React from 'react';
import { shallow } from 'enzyme';
import WalletCard from '../wallet-card';
import { CardConfigData, GiftCardsData } from '../../../../testData';

const GetBalanceReturnValue = 5;

jest.mock('../../../../services/gift-card', () => ({
  getLatestBalance: (): number => GetBalanceReturnValue
}));

describe('Wallet Card', () => {
  it('should create the component', () => {
    const wrapper = shallow(<WalletCard cards={GiftCardsData} cardConfig={CardConfigData} type="pocket" />);
    expect(wrapper.exists()).toBeTruthy();
  });

  it('should return pocket card for type=pocket', () => {
    const expectedCardLogoValues = {
      src: CardConfigData.logo,
      alt: `${CardConfigData.displayName} logo`
    };
    const wrapper = shallow(<WalletCard cards={GiftCardsData} cardConfig={CardConfigData} type="pocket" />);
    const cardLogoImg = wrapper.find('#pocketCardLogo');
    expect(cardLogoImg.prop('src')).toBe(expectedCardLogoValues.src);
    expect(cardLogoImg.prop('alt')).toBe(expectedCardLogoValues.alt);
    expect(wrapper.find('.wallet-card__card__balance').text()).toBe(`$${GetBalanceReturnValue}`);
  });

  it('should return brand box card for type=brand-box', () => {
    const expectedCardLogoValues = {
      src: CardConfigData.logo,
      alt: `${CardConfigData.displayName} logo`
    };
    const wrapper = shallow(<WalletCard cards={GiftCardsData} cardConfig={CardConfigData} type="brand-box" />);
    expect(wrapper.find('#pocketCardLogo').exists()).toBeFalsy();

    const cardLogoImg = wrapper.find('#brandBoxCardLogo');
    expect(cardLogoImg.prop('src')).toBe(expectedCardLogoValues.src);
    expect(cardLogoImg.prop('alt')).toBe(expectedCardLogoValues.alt);
    expect(wrapper.find('.wallet-card--brand-box__balance').text()).toBe(`$${GetBalanceReturnValue}`);
    expect(wrapper.find('.wallet-card--card-box__text').exists()).toBeFalsy();
  });

  it('should return CardBox for type=card-box', () => {
    const wrapper = shallow(<WalletCard cards={GiftCardsData} cardConfig={CardConfigData} type="card-box" />);
    expect(wrapper.find('#pocketCardLogo').exists()).toBeFalsy();
    expect(wrapper.find('#brandBoxCardLogo').exists()).toBeFalsy();
    expect(wrapper.find('.wallet-card--card-box__text__label').text()).toBe('Gift Card');
    expect(wrapper.find('.wallet-card--card-box__text__note').text()).toBe('Purchased 4/23/20');
    expect(wrapper.find('.wallet-card--card-box__balance').text()).toBe(`$${GetBalanceReturnValue}`);
  });
});
