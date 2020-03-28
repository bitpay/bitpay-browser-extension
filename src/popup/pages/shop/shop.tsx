import React from 'react';
import { Link } from 'react-router-dom';
import { CardConfig } from '../../../services/gift-card.types';

import MerchantCell from '../../components/merchant-cell/merchant-cell';

const Shop: React.FC<{ merchants: CardConfig[] }> = ({ merchants }) => (
  <div>
    <div>Shop ({merchants?.length})</div>
    {merchants.map(merchant => (
      <Link to={`brand/${merchant.name}`} key={merchant.name}>
        <MerchantCell
          key={merchant.name}
          avatar={merchant.icon}
          displayName={merchant.displayName}
          currency={merchant.currency}
          minAmount={merchant.minAmount}
          maxAmount={merchant.maxAmount}
          amounts={merchant.supportedAmounts}
        />
      </Link>
    ))}
  </div>
);

export default Shop;
