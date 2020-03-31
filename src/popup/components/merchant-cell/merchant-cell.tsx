import React from 'react';
import './merchant-cell.scss';
import { Merchant } from '../../../services/merchant';
import CardDenoms from '../card-denoms/card-denoms';

const MerchantCell: React.FC<{ merchant: Merchant }> = ({ merchant }) => {
  const cardConfig = merchant.giftCards[0];
  return (
    <div className="MerchantCell">
      <img className="MerchantCell__Avatar" alt="amazon" src={merchant.icon} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="MerchantCell__Title">{merchant.displayName}</div>
        <div className="MerchantCell__Caption">
          {merchant.hasDirectIntegration ? <>{merchant.caption}</> : <CardDenoms cardConfig={cardConfig} />}
        </div>
      </div>
    </div>
  );
};

export default MerchantCell;
