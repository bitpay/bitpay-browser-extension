import React from 'react';
import { Link } from 'react-router-dom';
import { GiftCard, CardConfig } from '../../../services/gift-card.types';
import './cards.scss';
import WalletCard from '../../components/wallet-cards/wallet-card';
import { sortByDescendingDate } from '../../../services/gift-card';
import { resizeFrame } from '../../../services/frame';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Cards: React.FC<any> = ({ location, purchasedGiftCards }) => {
  const { cardConfig } = location.state as { cards: GiftCard[]; cardConfig: CardConfig };
  const cards = (purchasedGiftCards as GiftCard[])
    .filter(card => card.name === cardConfig.name && !card.archived && card.status !== 'UNREDEEMED')
    .sort(sortByDescendingDate);
  resizeFrame(405);
  return (
    <>
      <div className="cards-page">
        <WalletCard type="brand-box" cards={cards} cardConfig={cardConfig} />
        {cards.map((card, index) => (
          <Link
            to={{
              pathname: `/card/${card.invoiceId}`,
              state: {
                card,
                cardConfig
              }
            }}
            key={index}
          >
            <WalletCard type="card-box" cards={[card]} cardConfig={cardConfig} />
          </Link>
        ))}
      </div>
      <div className="action-button__footer--fixed">
        <Link className="action-button" to={{ pathname: `/amount/${cardConfig.name}`, state: { cardConfig } }}>
          Top Up
        </Link>
      </div>
    </>
  );
};

export default Cards;
