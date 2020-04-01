import React from 'react';
import { Link } from 'react-router-dom';
import { GiftCard, CardConfig } from '../../../services/gift-card.types';
import './cards.scss';
import WalletCard from '../../components/wallet-cards/wallet-card';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Cards: React.FC<any> = ({ location }) => {
  const { cards, cardConfig } = location.state as { cards: GiftCard[]; cardConfig: CardConfig };
  return (
    <>
      <div className="cards-page">
        <WalletCard type="brand-box" cards={cards} cardConfig={cardConfig} />
        {cards.map(card => (
          <Link
            to={{
              pathname: `/card/${card.invoiceId}`,
              state: {
                card
              }
            }}
            key={card.invoiceId}
          >
            <WalletCard type="card-box" cards={[card]} cardConfig={cardConfig} />
          </Link>
        ))}
      </div>
      <div className="action-button__footer">
        <Link className="action-button" to={{ pathname: `/amount/${cardConfig.name}`, state: { cardConfig } }}>
          Top Up
        </Link>
      </div>
    </>
  );
};

export default Cards;
