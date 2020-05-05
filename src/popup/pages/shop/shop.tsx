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
import { listAnimation } from '../../../services/animations';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Shop: React.FC<{ directory: Directory; merchants: Merchant[]; location: any }> = ({
  directory,
  merchants,
  location
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [searchVal, setSearchVal] = useState('' as string);
  const [isDirty, setDirty] = useState(false);
  const categories = directory.categories
    ? Object.keys(directory.categories).sort((a, b) =>
        directory.categories[a].displayName.localeCompare(directory.categories[b].displayName)
      )
    : null;
  const curation = directory.curated ? Object.keys(directory.curated) : null;
  const filteredMerchants = merchants.filter(
    merchant =>
      searchVal &&
      (merchant.name.toLowerCase().includes(searchVal.toLowerCase()) ||
        merchant.tags.find(category => category.includes(searchVal.toLowerCase())))
  );
  const handleClick = (): void => {
    location.state = { scrollTop: ref.current?.scrollTop as number, searchVal };
  };
  useEffect(() => {
    if (searchVal) setDirty(true);
  }, [searchVal]);
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
  }, [searchVal, directory]);
  return (
    <div className="shop-page" ref={ref}>
      <SearchBar output={setSearchVal} value={searchVal} />
      <div className="shop-page__content">
        {searchVal ? (
          <>
            {filteredMerchants.length > 0 ? (
              <>
                <div className="shop-page__section-header">Search Results</div>
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
            {directory && (
              <>
                {curation && curation.length > 0 && (
                  <>
                    {curation.map(category => (
                      <React.Fragment key={category}>
                        <div className="shop-page__section-header">
                          {directory.curated[category].displayName}
                          <Link
                            className="shop-page__section-header--action"
                            to={{
                              pathname: `/category/${directory.curated[category].displayName}`,
                              state: { curation: directory.curated[category] }
                            }}
                            onClick={handleClick}
                          >
                            See All
                          </Link>
                        </div>
                        {directory.curated[category].availableMerchants.map((merchant, index) => (
                          <React.Fragment key={merchant.name}>
                            {index < 3 && (
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
                            )}
                          </React.Fragment>
                        ))}
                        <div className="shop-page__divider" />
                      </React.Fragment>
                    ))}
                  </>
                )}
                <div className="shop-page__section-header shop-page__section-header--large">
                  Categories
                  <Link
                    className="shop-page__section-header--action"
                    to={{
                      pathname: '/category/all',
                      state: { curation: null, category: null }
                    }}
                    onClick={handleClick}
                  >
                    See All Brands
                  </Link>
                </div>
                {categories && categories.length > 0 && (
                  <div className="shop-page__categories">
                    {categories.map(category => (
                      <Link
                        className="shop-page__categories__item"
                        key={category}
                        to={{
                          pathname: `/category/${directory.categories[category].emoji}`,
                          state: { category: directory.categories[category] }
                        }}
                        onClick={handleClick}
                      >
                        <div className="shop-page__categories__item__icon">{directory.categories[category].emoji}</div>
                        {directory.categories[category].displayName}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Shop;
