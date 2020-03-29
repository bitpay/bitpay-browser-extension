import React from 'react';
import { GiftCard } from '../../../services/gift-card.types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Card: React.FC<any> = ({ location }) => {
  const card = location.state.card as GiftCard;
  return (
    <div>
      <div>You bought me a while back kiddo via Invoice {card.invoiceId}. </div>
    </div>
  );
};

export default Card;
