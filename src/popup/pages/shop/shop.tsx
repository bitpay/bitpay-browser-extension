import React, { useState } from 'react';
import './shop.scss';

import { Link } from 'react-router-dom';
import SearchBar from '../../components/search-bar/search-bar';
import MerchantCell from '../../components/merchant-cell/merchant-cell';
import { Merchant } from '../../../services/merchant';
import { resizeFrame, FrameDimensions } from '../../../services/frame';

const Shop: React.FC<{ merchants: Merchant[] }> = ({ merchants }) => {
  const [searchVal, setSearchVal] = useState('' as string);
  const featuredMerchants = merchants.filter(merchant => merchant.featured);
  function filteredMerchants(): Merchant[] {
    return merchants.filter(merchant =>
      searchVal
        ? merchant.name.toLowerCase().includes(searchVal.toLowerCase()) ||
          merchant.tags.find(category => category.includes(searchVal.toLowerCase()))
        : !merchant.featured
    );
  }
  return (
    <div className="shop-page">
      <SearchBar output={setSearchVal} />
      {!searchVal && (
        <>
          <div className="shop-page__section-header">Popular Brands</div>
          {featuredMerchants.map(merchant => (
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
        </>
      )}
      {filteredMerchants().length > 0 ? (
        <>
          <div className="shop-page__section-header">
            {searchVal ? <>Search Results</> : <>Shop {merchants?.length} Brands</>}
          </div>
          {filteredMerchants().map(merchant => (
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
        </>
      ) : (
        <div className="zero-state" style={{ height: '75%' }}>
          <div className="zero-state__title">No Results</div>
          <div className="zero-state__subtitle">Please trying searching something else</div>
        </div>
      )}
    </div>
  );
};

export default Shop;
