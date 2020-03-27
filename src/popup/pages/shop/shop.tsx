import React from 'react';
import { Link } from 'react-router-dom';
import { CardConfig } from '../../../services/gift-card.types';

const Shop: React.FC<{ merchants: CardConfig[] }> = ({ merchants }) => (
  <div>
    <div>Shop ({merchants?.length})</div>
    {merchants.map(merchant => (
      <Link to={`brand/${merchant.name}`}>
        <div>{merchant.displayName}</div>
      </Link>
    ))}
  </div>
);

export default Shop;
