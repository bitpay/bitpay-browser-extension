import React from 'react';
import './merchant-cell.scss';
import { Merchant, formatDiscount } from '../../../services/merchant';
import CardDenoms from '../card-denoms/card-denoms';

const MerchantCell: React.FC<{ merchant: Merchant }> = ({ merchant }) => {
  const cardConfig = merchant.giftCards[0];
  return (
    <div className="merchant-cell">
      <img className="merchant-cell__avatar" alt="amazon" src={merchant.icon} />
      <div className="merchant-cell__block">
        <div className="merchant-cell__title">{merchant.displayName}</div>
        {merchant.discount ? (
          <div className="merchant-cell__caption" style={{ color: merchant.theme, fontWeight: 500 }}>
            {formatDiscount(merchant.discount, cardConfig ? cardConfig.currency : merchant.discount.currency)} Off Every
            Purchase
          </div>
        ) : (
          <div className="merchant-cell__caption">
            {merchant.hasDirectIntegration ? <>{merchant.caption}</> : <CardDenoms cardConfig={cardConfig} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantCell;
