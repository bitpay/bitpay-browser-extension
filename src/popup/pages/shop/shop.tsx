import React from 'react';
import './shop.scss';

import { Link } from 'react-router-dom';

import MerchantCell from '../../components/merchant-cell/merchant-cell';
import { Merchant } from '../../../services/merchant';
import { resizeFrame, FrameDimensions } from '../../../services/frame';

const Shop: React.FC<{ merchants: Merchant[] }> = ({ merchants }) => (
  <div className="shop-page">
    <div className="shop-page__section-header">
      Popular Brands
      {/* <div className="shop-page__section-header--action">See All</div> */}
    </div>
    {merchants
      .filter(merchant => merchant.featured)
      .map(merchant => (
        <Link
          to={{
            pathname: `/brand/${merchant.name}`,
            state: { merchant }
          }}
          key={merchant.name}
          onClick={(): void => resizeFrame(FrameDimensions.height)}
        >
          <MerchantCell key={merchant.name} merchant={merchant} />
        </Link>
      ))}
    <div className="shop-page__divider" />
    <div className="shop-page__section-header">Shop {merchants?.length} Brands</div>
    {merchants
      .filter(merchant => !merchant.featured)
      .map(merchant => (
        <Link
          to={{
            pathname: `/brand/${merchant.name}`,
            state: { merchant }
          }}
          key={merchant.name}
          onClick={(): void => resizeFrame(FrameDimensions.height)}
        >
          <MerchantCell key={merchant.name} merchant={merchant} />
        </Link>
      ))}
  </div>
);

export default Shop;
