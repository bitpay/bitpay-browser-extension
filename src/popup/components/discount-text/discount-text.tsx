import React from 'react';
import { Merchant, formatDiscount } from '../../../services/merchant';
import { GiftCardDiscount } from '../../../services/gift-card.types';

const DiscountText: React.FC<{ merchant: Merchant }> = ({ merchant }) => {
  const cardConfig = merchant.giftCards[0];
  const discount = merchant.discount || (cardConfig && cardConfig.discounts && cardConfig.discounts[0]);
  const discountCurrency = merchant.discount ? merchant.discount.currency : cardConfig && cardConfig.currency;
  const color = merchant.theme === '#ffffff' ? '#4f6ef7' : merchant.theme;
  return (
    <div className="ellipsis" style={{ color, fontWeight: 700 }}>
      {formatDiscount(discount as GiftCardDiscount, discountCurrency)} Off Every Purchase
    </div>
  );
};

export default DiscountText;
