import React from 'react';
import './merchant-cell.scss';
import { Merchant } from '../../../services/merchant';
import CardDenoms from '../card-denoms/card-denoms';
import DiscountText from '../discount-text/discount-text';
import { getVisibleCoupon } from '../../../services/gift-card';

const MerchantCell: React.FC<{ merchant: Merchant }> = ({ merchant }) => {
  const cardConfig = merchant.giftCards[0];
  const discount = merchant.discount || getVisibleCoupon(cardConfig);
  return (
    <div className="merchant-cell">
      <img className="merchant-cell__avatar" alt={`${merchant.displayName} logo`} src={merchant.icon} />
      <div className="merchant-cell__block">
        <div className="merchant-cell__title">{merchant.displayName}</div>
        {discount ? (
          <div className="merchant-cell__caption">
            <DiscountText merchant={merchant} />
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
