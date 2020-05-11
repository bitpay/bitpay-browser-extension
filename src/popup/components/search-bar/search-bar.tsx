import './search-bar.scss';
import React, { useState, useEffect } from 'react';
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
  return (
    <div className="search-bar--wrapper">
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
            <button onClick={clearSearchBox} type="button">
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
    </div>
  );
};

export default SearchBar;
