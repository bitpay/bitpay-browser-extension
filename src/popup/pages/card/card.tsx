import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Card: React.FC<any> = ({ match: { params } }) => (
  <div>
    <div>You bought me a while back kiddo via Invoice {params.id}. </div>
  </div>
);

export default Card;
