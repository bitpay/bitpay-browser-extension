import React, { useEffect, useState } from 'react';
import { motion, transform } from 'framer-motion';
import './search-bar.scss';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { useTracking } from 'react-tracking';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SearchBar: React.FC<any> = ({ output, value }) => {
  const tracking = useTracking();
  const [analyticsSubject] = useState(new Subject());
  useEffect(() => {
    analyticsSubject.pipe(debounceTime(1000)).subscribe(query => {
      tracking.trackEvent({ action: 'searched', query, gaAction: `searched:${query}` });
    });
  }, [analyticsSubject, tracking]);
  const onChange = (e: React.FormEvent<HTMLInputElement>): void => {
    output(e.currentTarget.value);
    analyticsSubject.next(e.currentTarget.value);
  };
  const clearSearchBox = (): void => {
    output('');
    tracking.trackEvent({ action: 'clearedSearchBox' });
  };
  const [scrollY, setScrollY] = useState(window.scrollY);
  const boxShadow = { boxShadow: `0 1px 5px 0 rgba(0, 0, 0, ${transform(scrollY, [0, 20], [0, 0.05])})` };
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleScroll = (e: any): void => setScrollY(e?.currentTarget?.scrollTop);
    const parent = document.getElementById('search-bar')?.parentElement;
    if (parent) parent.addEventListener('scroll', handleScroll);
    return (): void => parent?.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <motion.div id="search-bar" className="search-bar--wrapper" style={boxShadow}>
      <div className="search-bar">
        <div className="search-bar__box">
          <input
            value={value || ''}
            onChange={onChange}
            className="search-bar__box__input"
            placeholder="Search Brand or Category"
            type="text"
          />
          {value ? (
            <button onClick={clearSearchBox} className="d-flex" type="button">
              <img
                id="searchClearIcon"
                className="search-bar__box__icon"
                alt="search"
                src="../assets/icons/search-clear-icon.svg"
              />
            </button>
          ) : (
            <img id="searchIcon" className="search-bar__box__icon" alt="search" src="../assets/icons/search-icon.svg" />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SearchBar;
