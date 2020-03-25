import React from 'react';
import { Link } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Cards: React.FC<any> = ({ match: { params } }) => (
  <div>
    <div>Woah you keep buyin {params.brand}. Okay then.</div>
    <Link to="/card/1">
      <div>Card 1 ($50)</div>
    </Link>
    <Link to="/card/2">
      <div>Card 2 ($100)</div>
    </Link>
  </div>
);

export default Cards;
