import React from 'react';
import { Merchant, formatDiscount } from '../../../services/merchant';
import { DirectoryDiscount } from '../../../services/directory';

const DiscountText: React.FC<{ merchant: Merchant }> = ({ merchant }) => {
  const cardConfig = merchant.giftCards[0];
  const discount = merchant.discount || (cardConfig && cardConfig.discounts && cardConfig.discounts[0]);
  const discountCurrency = merchant.discount ? merchant.discount.currency : cardConfig && cardConfig.currency;
  const color = merchant.theme === '#ffffff' ? '#4f6ef7' : merchant.theme;
  const text = { color, fontWeight: 700 };
  return (
    <div className="ellipsis" style={text}>
      {formatDiscount(discount as DirectoryDiscount, discountCurrency)}
    </div>
  );
};

export default DiscountText;
