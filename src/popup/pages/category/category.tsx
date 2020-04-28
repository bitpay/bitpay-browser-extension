/* eslint-disable no-nested-ternary */
/* eslint-disable indent */
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
const Category: React.FC<{ location: any; merchants: Merchant[] }> = ({ location, merchants }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { category, curation } = location.state as { category?: DirectoryCategory; curation?: DirectoryCuration };
  const [searchVal, setSearchVal] = useState('' as string);
  const [isDirty, setDirty] = useState(false);
  const baseSet = (): Merchant[] => {
    if (curation) return merchants.filter(merchant => curation.merchants.includes(merchant.displayName));
    if (category) return merchants.filter(merchant => category.tags.some(tag => merchant.tags.includes(tag)));
    return merchants;
  };
  const renderList = baseSet().filter(merchant =>
    searchVal
      ? merchant.name.toLowerCase().includes(searchVal.toLowerCase()) ||
        merchant.tags.find(tag => tag.includes(searchVal.toLowerCase()))
      : baseSet
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
    resizeToFitPage(ref);
  }, [searchVal, renderList]);
  return (
    <div className="category-page" ref={ref}>
      <SearchBar output={setSearchVal} value={searchVal} />
      <div className="shop-page__content">
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
                initial={index > 7 || isDirty ? 'base' : 'delta'}
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
      </div>
    </div>
  );
};

export default Category;
