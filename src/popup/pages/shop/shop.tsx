import React, { useState, useEffect, useRef } from 'react';
import './shop.scss';

import { Link } from 'react-router-dom';
import SearchBar from '../../components/search-bar/search-bar';
import MerchantCell from '../../components/merchant-cell/merchant-cell';
import { Merchant } from '../../../services/merchant';
import { resizeToFitPage } from '../../../services/frame';

const Shop: React.FC<{ merchants: Merchant[] }> = ({ merchants }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    resizeToFitPage(ref);
  }, [ref]);

  const [searchVal, setSearchVal] = useState('' as string);
  const featuredMerchants = merchants.filter(merchant => merchant.featured);
  const filteredMerchants = merchants.filter(merchant =>
    searchVal
      ? merchant.name.toLowerCase().includes(searchVal.toLowerCase()) ||
        merchant.tags.find(category => category.includes(searchVal.toLowerCase()))
      : !merchant.featured
  );

  return (
    <div className="shop-page" ref={ref}>
      <SearchBar output={setSearchVal} value={searchVal} />
      <div className="shop-page__content">
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
              >
                <MerchantCell key={merchant.name} merchant={merchant} />
              </Link>
            ))}
            <div className="shop-page__divider" />
          </>
        )}
        {filteredMerchants.length > 0 ? (
          <>
            <div className="shop-page__section-header">
              {searchVal ? <>Search Results</> : <>Shop {merchants?.length} Brands</>}
            </div>
            {filteredMerchants.map(merchant => (
              <Link
                to={{
                  pathname: `/brand/${merchant.name}`,
                  state: { merchant }
                }}
                key={merchant.name}
              >
                <MerchantCell key={merchant.name} merchant={merchant} />
              </Link>
            ))}
          </>
        ) : (
          <div className="zero-state" style={{ marginTop: '50%' }}>
            <div className="zero-state__title">No Results</div>
            <div className="zero-state__subtitle">Please try searching something else</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
