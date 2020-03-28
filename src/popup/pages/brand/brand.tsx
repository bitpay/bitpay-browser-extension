import React from 'react';
import { Link } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Brand: React.FC<any> = ({ match: { params } }) => (
  <div>
    <div>Buy me quick, I'm {params.brand}.</div>
    <Link to={`/amount/${params.brand}`}>Buy Credits</Link>
  </div>
);

export default Brand;
