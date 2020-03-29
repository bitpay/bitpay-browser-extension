import React from 'react';
import './shop.scss';

import { Link } from 'react-router-dom';
import { CardConfig } from '../../../services/gift-card.types';

import MerchantCell from '../../components/merchant-cell/merchant-cell';

const Shop: React.FC<{ merchants: CardConfig[] }> = ({ merchants }) => (
  <div className="shop-page">
    <div className="list-header">
      Popular Brands
      {/* <div className="list-header__action">See All</div> */}
    </div>
    {merchants
      .filter(merchant => merchant.featured)
      .map(merchant => (
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
    <div className="category-divider" />
    <div className="list-header">Shop {merchants?.length} Brands</div>
    {merchants
      .filter(merchant => !merchant.featured)
      .map(merchant => (
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
