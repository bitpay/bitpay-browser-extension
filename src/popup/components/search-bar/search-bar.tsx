import React from 'react';
import './search-bar.scss';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SearchBar: React.FC<any> = ({ output }) => (
  <div className="search-bar--wrapper">
    <div className="search-bar">
      <div className="search-bar__box">
        <input
          onChange={(e: React.FormEvent<HTMLInputElement>): void => output(e.currentTarget.value)}
          className="search-bar__box__input"
          placeholder="Search Brand or Category"
          type="text"
        />
        <img className="search-bar__box__icon" alt="search" src="../assets/icons/search-icon.svg" />
      </div>
    </div>
  </div>
);

export default SearchBar;
