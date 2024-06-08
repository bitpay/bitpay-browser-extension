import React from 'react';
import classNames from 'classnames';
import { format } from 'date-fns';
import './wallet-card.scss';
import { GiftCard, CardConfig } from '../../../services/gift-card.types';
import { formatCurrency } from '../../../services/currency';
import { getLatestBalance } from '../../../services/gift-card';

const WalletCard: React.FC<{
  cards: GiftCard[];
  cardConfig: CardConfig;
  type: 'pocket' | 'brand-box' | 'card-box';
}> = ({ cards, cardConfig, type = 'pocket' }) => {
  const totalBalance = cards.reduce((sum, card) => sum + getLatestBalance(card), 0);
  const isGradient = cardConfig.logoBackgroundColor.indexOf('gradient') > -1;
  const cardBackgroundStyle = {
    ...(!isGradient && { background: cardConfig.logoBackgroundColor }),
    ...(isGradient && { backgroundImage: cardConfig.logoBackgroundColor })
  };
  return (
    <div
      className={classNames({
        light: cardConfig.logoBackgroundColor === '#ffffff'
      })}
    >
      {type === 'pocket' ? (
        <div className="wallet-card">
          <div className="wallet-card__card" style={cardBackgroundStyle}>
            <img id="pocketCardLogo" src={cardConfig.logo} alt={`${cardConfig.displayName} logo`} />
            <div className="wallet-card__card__balance">
              {formatCurrency(totalBalance, cardConfig.currency, { customPrecision: 'minimal' })}
            </div>
          </div>
          <div className="wallet-card__slot">
            <img id="pocketCardSlot" src="../../assets/slot.svg" alt="slot" />
          </div>
        </div>
      ) : (
        <div className={`wallet-card--${type}`} style={type === 'brand-box' ? cardBackgroundStyle : {}}>
          {type === 'brand-box' ? (
            <img id="brandBoxCardLogo" src={cardConfig.logo} alt={`${cardConfig.displayName} logo`} />
          ) : (
            <div className="wallet-card--card-box__text">
              <div className="wallet-card--card-box__text__label">Store Credit</div>
              <div className="wallet-card--card-box__text__note">{format(new Date(cards[0].date), 'MMM dd yyyy')}</div>
            </div>
          )}
          <div className={`wallet-card--${type}__balance`}>
            {formatCurrency(totalBalance, cardConfig.currency, { customPrecision: 'minimal' })}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletCard;
