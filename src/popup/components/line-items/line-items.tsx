import React from 'react';
import { format } from 'date-fns';
import { formatDiscount } from '../../../services/merchant';
import { CardConfig, GiftCard, UnsoldGiftCard } from '../../../services/gift-card.types';
import { formatCurrency } from '../../../services/currency';
import { getTotalDiscount, getDiscountAmount } from '../../../services/gift-card';
import './line-items.scss';

const LineItems: React.FC<{ cardConfig: CardConfig; card: Partial<GiftCard> & UnsoldGiftCard }> = ({
  cardConfig,
  card
}) => {
  // card.discounts = [{ type: 'percentage', amount: 5, code: 'five' }];
  const totalDiscount = getTotalDiscount(card.amount, card.discounts || cardConfig.discounts);
  return (
    <div className="line-items">
      {card.date && (
        <div className="line-items__item">
          <div className="line-items__item__label">Purchased</div>
          <div className="line-items__item__value">{format(new Date(card.date), 'MMM dd yyyy')}</div>
        </div>
      )}
      <div className="line-items__item">
        <div className="line-items__item__label">Credit Amount</div>
        <div className="line-items__item__value">
          {formatCurrency(card.amount, card.currency, { hideSymbol: true })}
        </div>
      </div>
      {card.discounts &&
        card.discounts.map((discount, index: number) => (
          <div className="line-items__item" key={index}>
            <div className="line-items__item__label">{formatDiscount(discount, cardConfig.currency)} Discount</div>
            <div className="line-items__item__value">
              -
              {formatCurrency(getDiscountAmount(card.amount, discount), card.currency, {
                hideSymbol: true
              })}
            </div>
          </div>
        ))}
      {totalDiscount && (
        <>
          <div className="line-items__item line-items__item">
            <div className={`line-items__item__label line-items__item__label${card.date ? '' : '--bold'}`}>
              Total Cost
            </div>
            <div className={`line-items__item__value line-items__item__value${card.date ? '' : '--bold'}`}>
              {formatCurrency(card.amount - totalDiscount, card.currency, { hideSymbol: !!card.date })}
            </div>
          </div>
        </>
      )}
      {card.invoice && (
        <>
          <div className="line-items__item">
            <div className="line-items__item__label">Amount Paid</div>
            <div className="line-items__item__value crypto-amount">
              {card.invoice.displayAmountPaid} {card.invoice.transactionCurrency}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LineItems;
