import React from 'react';
import { shallow } from 'enzyme';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createLocation, createMemoryHistory } from 'history';
// eslint-disable-next-line import/no-extraneous-dependencies
import { match } from 'react-router';
import Amount from './amount';
import ActionButton from '../../components/action-button/action-button';
import DiscountText from '../../components/discount-text/discount-text';
import { CardConfig, GiftCardDiscount } from '../../../services/gift-card.types';
import { CardConfigData, MerchantData } from '../../../testData';

const AmountProps = {
  clientId: 'abcd',
  email: '',
  purchasedGiftCards: [],
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  setPurchasedGiftCards: () => jest.fn()
};
const IsAmtValid = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let PayWithBitpay: any;

jest.mock('../../../services/gift-card', () => ({
  getCardPrecision: (): number => 2,
  isAmountValid: (): boolean => IsAmtValid
}));

jest.mock('../../../services/merchant', () => ({
  spreadAmounts: (): string => '$50, $100, $200, $250, $300, $400, $500, $1000'
}));

jest.mock('../../components/pay-with-bitpay/pay-with-bitpay', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, react/display-name
  PayWithBitpay = (): any => <div />;
  return PayWithBitpay;
});

jest.mock('../../../services/frame', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resizeFrame: (): any => jest.fn()
}));

describe('Amount Page', () => {
  let path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let history: any;
  let matchObj: match<{ id: string }>;
  let location;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wrapper: any;
  beforeEach(() => {
    path = '/amount/:brand';
    history = createMemoryHistory();

    matchObj = {
      isExact: false,
      path,
      url: path.replace(':brand', 'amazon'),
      params: { id: 'amazon' }
    };
    location = createLocation(path, { cardConfig: CardConfigData, merchant: MerchantData });

    wrapper = shallow(
      <Amount
        clientId={AmountProps.clientId}
        email={AmountProps.email}
        purchasedGiftCards={AmountProps.purchasedGiftCards}
        setPurchasedGiftCards={AmountProps.setPurchasedGiftCards}
        history={history}
        location={location}
        match={matchObj}
      />
    );
  });

  it('should create the component', () => {
    expect(wrapper.exists()).toBeTruthy();
  });

  it('should validate input value', () => {
    const inputText = [
      { value: 'alphabetic', expectedInputVal: '', expectedInputDivVal: '0' },
      { value: '12', expectedInputVal: '12', expectedInputDivVal: '12' },
      { value: '40.013', expectedInputVal: '40.01', expectedInputDivVal: '40.01' },
      { value: '200.11', expectedInputVal: '200.11', expectedInputDivVal: '200.11' },
      { value: '0.11', expectedInputVal: '0.11', expectedInputDivVal: '0.11' },
      { value: '4000', expectedInputVal: '', expectedInputDivVal: '0' },
      { value: '#$%12', expectedInputVal: '12', expectedInputDivVal: '12' },
      { value: 'alpha%12', expectedInputVal: '12', expectedInputDivVal: '12' }
    ];
    inputText.forEach(val => {
      const input = wrapper.find('input');
      input.simulate('change', { currentTarget: { value: val.value } });
      expect(wrapper.find('input').prop('value')).toBe(val.expectedInputVal);
      expect(wrapper.find('.amount-page__amount-box__amount__value').text()).toBe(val.expectedInputDivVal);
      input.simulate('change', { currentTarget: { value: '' } });
    });
  });

  it('should change page CTA based on paymentPageAvailable value', () => {
    expect(wrapper.find(ActionButton).exists()).toBeTruthy();
    expect(wrapper.find(PayWithBitpay).exists()).toBeFalsy();
    wrapper.setProps({ email: 'lanchanan@gmail.com' });
    expect(wrapper.find(ActionButton).exists()).toBeFalsy();
    expect(wrapper.find(PayWithBitpay).exists()).toBeTruthy();
  });

  it('should have displayName value as title', () => {
    expect(wrapper.find('.amount-page__merchant-name').text()).toBe(CardConfigData.displayName);
  });

  it('should hide/show DiscountText based on discount value', () => {
    expect(wrapper.find(DiscountText).exists()).toBeFalsy();

    const cardConfigData: CardConfig = CardConfigData;
    const discounts: GiftCardDiscount = {
      code: 'discountCode',
      type: 'percentage',
      amount: 10
    };
    cardConfigData.discounts = [discounts];
    location = createLocation(path, { cardConfig: cardConfigData, merchant: MerchantData });
    wrapper = shallow(
      <Amount
        clientId={AmountProps.clientId}
        email={AmountProps.email}
        purchasedGiftCards={AmountProps.purchasedGiftCards}
        setPurchasedGiftCards={AmountProps.setPurchasedGiftCards}
        history={history}
        location={location}
        match={matchObj}
      />
    );
    expect(wrapper.find(DiscountText).exists()).toBeTruthy();
  });
});
