import React from 'react';
import { Link } from 'react-router-dom';

const Wallet: React.FC = props => {
  console.log('wallet', props);
  return (
    <div>
      <div>Wallet</div>
      <Link to="/cards/Brand 1">
        <div>Purchased Brand 1 - $50</div>
      </Link>
      <Link to="/cards/Brand 2">
        <div>Purchased Brand 2 - $100</div>
      </Link>
    </div>
  );
};

export default Wallet;
