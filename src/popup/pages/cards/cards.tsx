import React from 'react';
import { Link } from 'react-router-dom';
import { GiftCard } from '../../../services/gift-card.types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Cards: React.FC<any> = ({ location }) => {
  const cards = location.state.cards as GiftCard[];
  return (
    <div>
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
          <div>
            {card.invoiceId} - $({card.amount})
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Cards;
