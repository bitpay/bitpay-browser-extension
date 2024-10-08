import React from 'react';
import { Merchant, formatDiscount, getCouponColor } from '../../../services/merchant';
import { DirectoryDiscount } from '../../../services/directory';
import { getVisibleCoupon } from '../../../services/gift-card';

const DiscountText: React.FC<{ merchant: Merchant }> = ({ merchant }) => {
  const cardConfig = merchant.giftCards[0];
  const discount = merchant.discount || getVisibleCoupon(cardConfig);
  const discountCurrency = merchant.discount ? merchant.discount.currency : cardConfig && cardConfig.currency;
  const color = getCouponColor(merchant);
  const text = { color, fontWeight: 700 };
  return (
    <div className="ellipsis" style={text}>
      {formatDiscount(discount as DirectoryDiscount, discountCurrency)}
    </div>
  );
};

export default DiscountText;
