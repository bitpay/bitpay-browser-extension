import React from 'react';
import { Link } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Amount: React.FC<any> = ({ match: { params } }) => (
  <div>
    <div>How much of {params.brand} do you want?</div>
    <div>$0</div>
    <Link
      to={{
        pathname: `/payment/${params.brand}`,
        state: {
          amount: 1,
          currency: 'USD'
        }
      }}
    >
      Continue
    </Link>
  </div>
);

export default Amount;
