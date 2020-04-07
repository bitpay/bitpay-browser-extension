import React from 'react';
import { CardConfig, UnsoldGiftCard, GiftCard } from '../../../services/gift-card.types';
import { formatCurrency } from '../../../services/currency';
import './card-header.scss';

const CardHeader: React.FC<{ amount?: number; card: Partial<GiftCard> & UnsoldGiftCard; cardConfig: CardConfig }> = ({
  amount,
  card,
  cardConfig
}) => (
  <div className="card-header">
    <div className="card-header__title">{cardConfig.displayName}</div>
    <div className="card-header__balance">
      <img src={cardConfig.icon} alt={`${cardConfig.displayName} logo`} />
      {formatCurrency(typeof amount === 'undefined' ? card.amount : amount, card.currency, { hideSymbol: true })}
    </div>
  </div>
);

export default CardHeader;
