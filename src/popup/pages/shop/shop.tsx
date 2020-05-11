import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTracking } from 'react-tracking';
import Observer from '@researchgate/react-intersection-observer';
import SearchBar from '../../components/search-bar/search-bar';
import MerchantCell from '../../components/merchant-cell/merchant-cell';
import { Merchant, getGiftCardDiscount, getPromoEventParams } from '../../../services/merchant';
import { Directory } from '../../../services/directory';
import { resizeToFitPage } from '../../../services/frame';
import { wait } from '../../../services/utils';
import { listAnimation } from '../../../services/animations';
import { trackComponent } from '../../../services/analytics';
import './shop.scss';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Shop: React.FC<{ directory: Directory; merchants: Merchant[]; location: any }> = ({
  directory,
  merchants,
  location
}) => {
  const tracking = useTracking();
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
  const handleClick = (merchant?: Merchant): void => {
    location.state = { scrollTop: ref.current?.scrollTop as number, searchVal };
    if (merchant && getGiftCardDiscount(merchant)) {
      tracking.trackEvent({
        action: 'clickedGiftCardPromo',
        ...getPromoEventParams(merchant),
        gaAction: `clickedGiftCardPromo:${merchant.name}`
      });
    }
  };
  const MerchantItem: React.FC<{ merchant: Merchant }> = ({ merchant }) => (
    <Link
      to={{
        pathname: `/brand/${merchant.name}`,
        state: { merchant }
      }}
      key={merchant.name}
      onClick={(): void => handleClick(merchant)}
    >
      <MerchantCell key={merchant.name} merchant={merchant} />
    </Link>
  );
  const handleIntersection = (merchant: Merchant) => (event: IntersectionObserverEntry): void => {
    if (event.isIntersecting)
      tracking.trackEvent({
        action: 'presentedWithGiftCardPromo',
        ...getPromoEventParams(merchant),
        gaAction: `presentedWithGiftCardPromo:${merchant.name}`
      });
  };
  const ObservedItem: React.FC<{ merchant: Merchant }> = ({ merchant }) => (
    <>
      {getGiftCardDiscount(merchant) ? (
        <Observer onChange={handleIntersection(merchant)}>
          <div>
            <MerchantItem merchant={merchant} />
          </div>
        </Observer>
      ) : (
        <MerchantItem merchant={merchant} />
      )}
    </>
  );
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
      <SearchBar output={setSearchVal} value={searchVal} tracking={tracking} />
      <div className="shop-page__content">
        {searchVal ? (
          <>
            {filteredMerchants.length > 0 ? (
              <>
                <div className="shop-page__section-header">Search Results</div>
                {filteredMerchants.map(merchant => (
                  <ObservedItem merchant={merchant} key={merchant.name} />
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
                            onClick={(): void => handleClick()}
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
                                <ObservedItem merchant={merchant} key={merchant.name} />
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
                    onClick={(): void => handleClick()}
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
                          pathname: `/category/${directory.categories[category].displayName}`,
                          state: { category: directory.categories[category] }
                        }}
                        onClick={(): void => handleClick()}
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

export default trackComponent(Shop, { page: 'shop' });
