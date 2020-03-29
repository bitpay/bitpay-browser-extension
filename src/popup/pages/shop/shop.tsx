import React from 'react';
import './shop.scss';

import { Link } from 'react-router-dom';

import MerchantCell from '../../components/merchant-cell/merchant-cell';
import { Merchant } from '../../../services/merchant';

const Shop: React.FC<{ merchants: Merchant[] }> = ({ merchants }) => (
  <div className="shop-page">
    <div className="list-header">
      Popular Brands
      {/* <div className="list-header__action">See All</div> */}
    </div>
    {merchants
      .filter(merchant => merchant.featured)
      .map(merchant => (
        <Link to={`brand/${merchant.name}`} key={merchant.name}>
          <MerchantCell key={merchant.name} merchant={merchant} />
        </Link>
      ))}
    <div className="category-divider" />
    <div className="list-header">Shop {merchants?.length} Brands</div>
    {merchants
      .filter(merchant => !merchant.featured)
      .map(merchant => (
        <Link to={`brand/${merchant.name}`} key={merchant.name}>
          <MerchantCell key={merchant.name} merchant={merchant} />
        </Link>
      ))}
  </div>
);

export default Shop;
