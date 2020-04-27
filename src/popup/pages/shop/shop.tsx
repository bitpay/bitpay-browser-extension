import React, { useState, useEffect, useRef } from 'react';
import './shop.scss';

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SearchBar from '../../components/search-bar/search-bar';
import MerchantCell from '../../components/merchant-cell/merchant-cell';
import { Merchant } from '../../../services/merchant';
import { Directory } from '../../../services/directory';
import { resizeToFitPage } from '../../../services/frame';
import { wait } from '../../../services/utils';

const listAnimation = {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  base: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 250,
      delay: i * 0.04
    }
  }),
  delta: { opacity: 0, y: -32 }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Shop: React.FC<{ directory: Directory; merchants: Merchant[]; location: any }> = ({
  directory,
  merchants,
  location
}) => {
  const [searchVal, setSearchVal] = useState('' as string);
  const [isDirty, setDirty] = useState(false);
  useEffect(() => {
    if (searchVal) setDirty(true);
  }, [searchVal]);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const setScrollPositionAndSearchVal = async (): Promise<void> => {
      if (location.state) {
        setSearchVal(location.state.searchVal);
        await wait(0);
        if (ref.current) ref.current.scrollTop = location.state.scrollTop || 0;
      }
    };
    resizeToFitPage(ref);
    setScrollPositionAndSearchVal();
  }, [ref, location.state]);
  useEffect(() => {
    if (!searchVal) resizeToFitPage(ref);
  }, [searchVal]);
  const categories = directory.categories
    ? Object.keys(directory.categories).map(key => directory.categories[key])
    : null;
  const curation = directory.curated ? Object.keys(directory.curated).map(key => directory.curated[key]) : null;
  const filteredMerchants = merchants.filter(
    merchant =>
      searchVal &&
      (merchant.name.toLowerCase().includes(searchVal.toLowerCase()) ||
        merchant.tags.find(category => category.includes(searchVal.toLowerCase())))
  );
  const handleClick = (): void => {
    location.state = { scrollTop: ref.current?.scrollTop as number, searchVal };
  };
  return (
    <div className="shop-page" ref={ref}>
      <SearchBar output={setSearchVal} value={searchVal} />
      <div className="shop-page__content">
        {searchVal ? (
          <>
            {filteredMerchants.length > 0 ? (
              <>
                <div className="shop-page__section-header">
                  {searchVal ? <>Search Results</> : <>Shop {filteredMerchants?.length} Brands</>}
                </div>
                {filteredMerchants.map(merchant => (
                  <Link
                    to={{
                      pathname: `/brand/${merchant.name}`,
                      state: { merchant }
                    }}
                    key={merchant.name}
                    onClick={handleClick}
                  >
                    <MerchantCell key={merchant.name} merchant={merchant} />
                  </Link>
                ))}
                <div className="shop-page__divider" />
              </>
            ) : (
              <div className="zero-state">
                <div className="zero-state__title">No Results</div>
                <div className="zero-state__subtitle">Please try searching something else</div>
              </div>
            )}
          </>
        ) : (
          <>
            {curation && curation.length > 0 && (
              <>
                {curation.map(category => (
                  <React.Fragment key={category.displayName}>
                    <div className="shop-page__section-header">
                      {category.displayName}
                      <div className="shop-page__section-header--action">See All</div>
                    </div>
                    {merchants
                      .filter(merchant => category.merchants.includes(merchant.displayName))
                      .map((merchant, index) => (
                        <motion.div
                          custom={index}
                          initial={isDirty ? 'base' : 'delta'}
                          animate="base"
                          variants={listAnimation}
                          key={merchant.name}
                        >
                          <Link
                            to={{
                              pathname: `/brand/${merchant.name}`,
                              state: { merchant }
                            }}
                            key={merchant.name}
                            onClick={handleClick}
                          >
                            <MerchantCell key={merchant.name} merchant={merchant} />
                          </Link>
                        </motion.div>
                      ))}
                    <div className="shop-page__divider" />
                  </React.Fragment>
                ))}
              </>
            )}
            {categories && categories.length > 0 && (
              <>
                <div className="shop-page__section-header shop-page__section-header--large">
                  Categories
                  <div className="shop-page__section-header--action">See All Brands</div>
                </div>
                <div className="shop-page__categories">
                  {categories.map(category => (
                    <div className="shop-page__categories__item" key={category.displayName}>
                      <div className="shop-page__categories__item__icon">{category.emoji}</div>
                      {category.displayName}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Shop;
