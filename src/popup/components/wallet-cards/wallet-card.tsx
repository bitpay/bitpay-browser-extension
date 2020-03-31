import React from 'react';
import classNames from 'classnames';
import { GiftCard, CardConfig } from '../../../services/gift-card.types';
import './wallet-card.scss';

const WalletCard: React.FC<{ cards: GiftCard[]; cardConfig: CardConfig }> = ({ cards, cardConfig }) => {
  const totalBalance = cards.reduce((sum, card) => sum + card.amount, 0);
  const isGradient = cardConfig.logoBackgroundColor.indexOf('gradient') > -1;
  const cardBackgroundStyle = {
    ...(!isGradient && { background: cardConfig.logoBackgroundColor }),
    ...(isGradient && { backgroundImage: cardConfig.logoBackgroundColor })
  };
  return (
    <>
      <div
        className={classNames({
          'wallet-card': true,
          light: cardConfig.logoBackgroundColor === '#ffffff'
        })}
      >
        <div className="wallet-card__card" style={cardBackgroundStyle}>
          <img src={cardConfig.logo} alt={`${cardConfig.displayName} logo`} />
          <div className="wallet-card__card__balance">${totalBalance}</div>
        </div>
        <div className="wallet-card__slot">
          <img src="../../assets/slot.svg" alt="slot" />
        </div>
      </div>
    </>
  );
};

export default WalletCard;
