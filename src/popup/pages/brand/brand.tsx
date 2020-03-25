import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Brand: React.FC<any> = ({ match: { params } }) => (
  <div>
    <div>Buy me quick, I'm {params.brand}.</div>
  </div>
);

export default Brand;
