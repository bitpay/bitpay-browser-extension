import React from 'react';
import { shallow } from 'enzyme';
import { Link } from 'react-router-dom';
import WalletCards from '../wallet-cards';
import { CardConfigData, GiftCardsData } from '../../../../testData';

const GetBalanceReturnValue = 5;
jest.mock('../../../../services/gift-card', () => ({
  getLatestBalance: (): number => GetBalanceReturnValue
}));

describe('Wallet Cards', () => {
  it('should create the component for non empty list', () => {
    const wrapper = shallow(<WalletCards activeCards={GiftCardsData} supportedCards={[CardConfigData]} />);
    expect(wrapper.exists()).toBeTruthy();
  });

  it('should return a card/invoiceId link', () => {
    const wrapper = shallow(<WalletCards activeCards={GiftCardsData} supportedCards={[CardConfigData]} />);
    const expected = {
      pathname: `/card/${GiftCardsData[0].invoiceId}`,
      state: {
        cardConfig: CardConfigData,
        card: GiftCardsData[0]
      }
    };
    const linkProps = wrapper.find(Link).props().to;
    expect(linkProps).toEqual(expected);
  });

  it('should return card/brand link', () => {
    const giftCardsList = JSON.parse(JSON.stringify(GiftCardsData));
    giftCardsList.push(JSON.parse(JSON.stringify(GiftCardsData))[0]);
    const expected = {
      pathname: `/cards/${giftCardsList[0].name}`,
      state: {
        cardConfig: CardConfigData,
        cards: giftCardsList
      }
    };
    const wrapper = shallow(<WalletCards activeCards={giftCardsList} supportedCards={[CardConfigData]} />);
    const linkProps = wrapper.find(Link).props().to;
    expect(linkProps).toEqual(expected);
  });

  it('should return multiple links', () => {
    const giftCardsList = JSON.parse(JSON.stringify(GiftCardsData));
    giftCardsList.push(JSON.parse(JSON.stringify(GiftCardsData))[0]);
    giftCardsList[1].name = 'Nike.com';
    giftCardsList.push(JSON.parse(JSON.stringify(GiftCardsData))[0]);
    const cardConfigList = JSON.parse(JSON.stringify([CardConfigData]));
    cardConfigList.push(JSON.parse(JSON.stringify([CardConfigData]))[0]);
    cardConfigList[1].name = 'Nike.com';
    const expected = [
      {
        pathname: `/cards/${giftCardsList[0].name}`,
        state: {
          cardConfig: cardConfigList[0],
          cards: [giftCardsList[0], giftCardsList[2]]
        }
      },
      {
        pathname: `/card/${giftCardsList[1].invoiceId}`,
        state: {
          cardConfig: cardConfigList[1],
          card: giftCardsList[1]
        }
      }
    ];

    const wrapper = shallow(<WalletCards activeCards={giftCardsList} supportedCards={cardConfigList} />);
    expect(
      wrapper
        .find(Link)
        .first()
        .props().to
    ).toEqual(expected[0]);
    expect(
      wrapper
        .find(Link)
        .last()
        .props().to
    ).toEqual(expected[1]);
  });
});
