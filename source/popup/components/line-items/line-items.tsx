import React from 'react';
import { useTracking } from 'react-tracking';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { upperCut } from '../../../services/animations';
import { launchNewTab } from '../../../services/browser';
import { formatDiscount } from '../../../services/merchant';
import { CardConfig, GiftCard, UnsoldGiftCard } from '../../../services/gift-card.types';
import { formatCurrency } from '../../../services/currency';
import { getTotalDiscount, getDiscountAmount, getActivationFee, hasVisibleBoost } from '../../../services/gift-card';
import './line-items.scss';

const LineItems: React.FC<{ cardConfig: CardConfig; card: Partial<GiftCard> & UnsoldGiftCard }> = ({
  cardConfig,
  card
}) => {
  const tracking = useTracking();
  const activationFee = getActivationFee(card.amount, cardConfig);
  const totalDiscount = card.totalDiscount || getTotalDiscount(card.amount, card.coupons || card.discounts || cardConfig.coupons || cardConfig.discounts);
  const boosts = card.coupons && card.coupons.filter(coupon => coupon.displayType === 'boost');
  const boost = boosts && boosts[0];
  const discounts = card.discounts ? card.discounts : (card.coupons && card.coupons.filter(coupon => coupon.displayType === 'discount'));
  const discount = discounts && discounts[0];
  const openInvoice = (url: string) => (): void => {
    launchNewTab(`${url}&view=popup`);
    tracking.trackEvent({ action: 'clickedAmountPaid' });
  };
  return (
    <motion.div className="line-items" variants={upperCut} custom={0} animate="visible" initial="hidden">
      {card.date && (
        <div className="line-items__item">
          <div className="line-items__item__label">Purchased</div>
          <div className="line-items__item__value">{format(new Date(card.date), 'MMM dd yyyy')}</div>
        </div>
      )}
      {hasVisibleBoost(cardConfig) && (
        <div className="line-items__item line-items__item">
          <div className="line-items__item__label line-items__item__label">
            Entered Amount
          </div>
          <div className="line-items__item__value line-items__item__value">
            {formatCurrency(card.amount - totalDiscount, card.currency, { hideSymbol: true })}
          </div>
      </div>
      )}
      {boost && (
        <div className="line-items__item">
          <div className="line-items__item__label">
            {boost.code ? `${formatDiscount(boost, cardConfig.currency, true)} ` : ''}Boost
          </div>
          <div className="line-items__item__value">
            +&nbsp;
            {formatCurrency(getDiscountAmount(card.amount, boost), card.currency, {
              hideSymbol: true
            })}
          </div>
        </div>
      )}
      <div className="line-items__item">
        <div className="line-items__item__label">Credit Amount</div>
        <div className="line-items__item__value">
          {formatCurrency(card.amount, card.currency, { hideSymbol: true })}
        </div>
      </div>
      {activationFee > 0 && (
        <div className="line-items__item line-items__item">
          <div className="line-items__item__label">Activation Fee</div>
          <div className="line-items__item__value">
            {formatCurrency(activationFee, card.currency, { hideSymbol: true })}
          </div>
        </div>
      )}
      {discount && (
        <div className="line-items__item">
          <div className="line-items__item__label">
            {discount.code ? `${formatDiscount(discount, cardConfig.currency, true)} ` : ''}Discount
          </div>
          <div className="line-items__item__value">
            -&nbsp;
            {formatCurrency(getDiscountAmount(card.amount, discount), card.currency, {
              hideSymbol: true
            })}
          </div>
        </div>
      )}
      {(totalDiscount > 0 || activationFee > 0) && (
        <div className="line-items__item line-items__item">
          <div className={`line-items__item__label line-items__item__label${card.date ? '' : '--bold'}`}>
            Total Cost
          </div>
          <div className={`line-items__item__value line-items__item__value${card.date ? '' : '--bold'}`}>
            {formatCurrency(card.amount + activationFee - totalDiscount, card.currency, { hideSymbol: !!card.date })}
          </div>
        </div>
      )}
      {card.invoice && (
        <div className="line-items__item">
          <div className="line-items__item__label">Amount Paid</div>
          <button
            className="line-items__item__value crypto-amount"
            onClick={openInvoice(card.invoice.url)}
            type="button"
          >
            {card.invoice.displayAmountPaid} {card.invoice.transactionCurrency}
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default LineItems;
