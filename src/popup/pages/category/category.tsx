import React, { useRef, useState, useEffect } from 'react';
import './category.scss';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SearchBar from '../../components/search-bar/search-bar';
import MerchantCell from '../../components/merchant-cell/merchant-cell';
import { DirectoryCategory, DirectoryCuration } from '../../../services/directory';
import { Merchant } from '../../../services/merchant';
import { resizeToFitPage } from '../../../services/frame';
import { wait } from '../../../services/utils';
import { listAnimation } from '../../../services/animations';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Category: React.FC<{ location: any; merchants: Merchant[] }> = ({ location, merchants }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
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
  const resizeSwitch = (length: number): number => {
    if (length > 3) return 100;
    if (length > 2) return 50;
    return 0;
  };
  const handleClick = (): void => {
    location.state = { scrollTop: scrollRef.current?.scrollTop as number, searchVal, category, curation };
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
        if (location.state.searchVal) setSearchVal(location.state.searchVal);
        await wait(renderList.length > 24 ? 400 : 0);
        if (scrollRef.current) scrollRef.current.scrollTop = location.state.scrollTop || 0;
      }
    };
    resizeToFitPage(contentRef);
    setScrollPositionAndSearchVal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollRef, contentRef, location.state]);
  useEffect(() => {
    resizeToFitPage(contentRef, resizeSwitch(renderList.length));
  }, [searchVal, renderList]);
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
                    initial={index > 7 || location.state.scrollTop > 0 || isDirty ? 'base' : 'delta'}
                    animate="base"
                    variants={listAnimation}
                    key={merchant.name}
                  >
                    <Link
                      to={{
                        pathname: `/brand/${merchant.name}`,
                        state: { merchant, category, curation }
                      }}
                      key={merchant.name}
                      onClick={handleClick}
                    >
                      <MerchantCell key={merchant.name} merchant={merchant} />
                    </Link>
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
          <div className="spinner__wrapper">
            <img className="spinner" src="../assets/icons/spinner-thick.svg" alt="spinner" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;
