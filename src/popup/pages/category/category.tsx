import React, { useRef, useState, useEffect } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTracking } from 'react-tracking';
import Observer from '@researchgate/react-intersection-observer';
import SearchBar from '../../components/search-bar/search-bar';
import MerchantCell from '../../components/merchant-cell/merchant-cell';
import { DirectoryCategory, DirectoryCuration } from '../../../services/directory';
import { Merchant, getGiftCardDiscount, getPromoEventParams } from '../../../services/merchant';
import { resizeToFitPage } from '../../../services/frame';
import { wait } from '../../../services/utils';
import { listAnimation } from '../../../services/animations';
import { trackComponent } from '../../../services/analytics';
import './category.scss';

const Category: React.FC<RouteComponentProps & { merchants: Merchant[] }> = ({ location, merchants }) => {
  const tracking = useTracking();
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { searchVal: searchValue, scrollTop } = location.state as { searchVal: string; scrollTop: number };
  const { category, curation } = location.state as { category?: DirectoryCategory; curation?: DirectoryCuration };
  const [searchVal, setSearchVal] = useState('' as string);
  const [isDirty, setDirty] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const baseSet = ((): Merchant[] => {
    if (curation) return curation.availableMerchants;
    if (category) return category.availableMerchants;
    return merchants;
  })();
  const renderList = baseSet.filter(merchant =>
    searchVal
      ? merchant.name.toLowerCase().includes(searchVal.toLowerCase()) ||
        merchant.tags.find(tag => tag.includes(searchVal.toLowerCase()))
      : baseSet
  );
  const handleIntersection = (merchant: Merchant) => (event: IntersectionObserverEntry): void => {
    if (event.isIntersecting)
      tracking.trackEvent({
        action: 'presentedWithGiftCardPromo',
        ...getPromoEventParams(merchant),
        gaAction: `presentedWithGiftCardPromo:${merchant.name}`
      });
  };
  const resizeSwitch = (length: number): number => {
    if (length > 3) return 100;
    if (length > 2) return 50;
    return 0;
  };
  const handleClick = (merchant: Merchant): void => {
    location.state = { scrollTop: scrollRef.current?.scrollTop as number, searchVal, category, curation };
    if (getGiftCardDiscount(merchant)) {
      tracking.trackEvent({
        action: 'clickedGiftCardPromo',
        ...getPromoEventParams(merchant),
        gaAction: `clickedGiftCardPromo:${merchant.name}`
      });
    }
  };
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (renderList.length > 24) {
      timer = setTimeout(() => setLoaded(true), 400);
    } else {
      setLoaded(true);
    }
    return (): void => {
      if (timer) {
        clearTimeout(timer);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (searchVal) setDirty(true);
  }, [searchVal]);
  useEffect(() => {
    const setScrollPositionAndSearchVal = async (): Promise<void> => {
      if (location.state) {
        if (searchValue) setSearchVal(searchValue);
        await wait(renderList.length > 24 ? 400 : 0);
        if (scrollRef.current) scrollRef.current.scrollTop = scrollTop || 0;
      }
    };
    resizeToFitPage(contentRef);
    setScrollPositionAndSearchVal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollRef, contentRef, location.state]);
  useEffect(() => {
    resizeToFitPage(contentRef, resizeSwitch(renderList.length));
  }, [searchVal, renderList]);
  const ListItem: React.FC<{ merchant: Merchant }> = ({ merchant }) => (
    <Link
      to={{
        pathname: `/brand/${merchant.name}`,
        state: { merchant, category, curation }
      }}
      key={merchant.name}
      onClick={(): void => handleClick(merchant)}
    >
      <MerchantCell key={merchant.name} merchant={merchant} />
    </Link>
  );
  return (
    <div className="category-page" ref={scrollRef}>
      <SearchBar output={setSearchVal} value={searchVal} />
      <div className="shop-page__content" ref={contentRef}>
        {loaded ? (
          <>
            {renderList.length > 0 ? (
              <>
                <div className="shop-page__section-header">
                  {searchVal ? (
                    <>Search Results</>
                  ) : (
                    <>
                      {curation && <>{curation.displayName}</>}
                      {category && (
                        <div className="shop-page__section-header--wrapper">
                          <div className="shop-page__section-header--emoji">{category.emoji}</div>
                          {category.displayName}
                        </div>
                      )}
                      {!curation && !category && <>Shop {renderList.length} Brands</>}
                    </>
                  )}
                </div>
                {renderList.map((merchant, index) => (
                  <motion.div
                    custom={index}
                    initial={index > 7 || scrollTop > 0 || isDirty ? 'base' : 'delta'}
                    animate="base"
                    variants={listAnimation}
                    key={merchant.name}
                  >
                    {getGiftCardDiscount(merchant) ? (
                      <Observer onChange={handleIntersection(merchant)}>
                        <div>
                          <ListItem merchant={merchant} />
                        </div>
                      </Observer>
                    ) : (
                      <ListItem merchant={merchant} />
                    )}
                  </motion.div>
                ))}
              </>
            ) : (
              <div className="zero-state">
                <div className="zero-state__title">No Results</div>
                <div className="zero-state__subtitle">Please try searching something else</div>
              </div>
            )}
          </>
        ) : (
          <div className="loading-spinner__wrapper">
            <img className="loading-spinner" src="../assets/icons/spinner-thick.svg" alt="spinner" />
          </div>
        )}
      </div>
    </div>
  );
};

export default trackComponent(Category, { page: 'category' });
