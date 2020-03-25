import React from 'react';
import { Link } from 'react-router-dom';

const Shop: React.FC = () => (
  <div>
    <div>Shop</div>
    <Link to="brand/Brand 1">
      <div>Brand 1</div>
    </Link>
    <Link to="brand/Brand 2">
      <div>Brand 2</div>
    </Link>
  </div>
);

export default Shop;
