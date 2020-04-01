/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './amount.scss';
import CardDenoms from '../../components/card-denoms/card-denoms';
import PayWithBitpay from '../../components/pay-with-bitpay/pay-with-bitpay';
import { GiftCardInvoiceParams, CardConfig } from '../../../services/gift-card.types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Amount: React.FC<any> = ({ location, clientId, history }) => {
  console.log('clientId', clientId);
  const { cardConfig } = location.state as { cardConfig: CardConfig };
  const hasFixedDenoms = cardConfig.supportedAmounts && cardConfig.supportedAmounts[0];
  const initialAmount =
    cardConfig.supportedAmounts && cardConfig.supportedAmounts[0] ? cardConfig.supportedAmounts[0] : 0;
  const [amount, setAmount] = useState(initialAmount);
  const hasDiscount = false;
  const invoiceParams: GiftCardInvoiceParams = {
    brand: cardConfig.name,
    currency: cardConfig.currency,
    amount: 1,
    clientId,
    discounts: [],
    email: 'satoshi@nakamoto.com'
  };
  console.log('invoiceParams', invoiceParams);
  const changeFixedAmount = (delta: number): void => {
    const denoms = cardConfig.supportedAmounts as number[];
    const maxIndex = denoms.length - 1;
    const currentIndex = denoms.indexOf(amount);
    const indexDelta = delta > 0 ? 1 : -1;
    const newIndex = currentIndex + indexDelta;
    // eslint-disable-next-line no-nested-ternary
    const index = newIndex < 0 ? 0 : newIndex > maxIndex ? maxIndex : newIndex;
    setAmount(denoms[index]);
  };
  const changeVariableAmount = (delta: number): void => {
    if (amount === 0 && delta < 0) {
      return setAmount(0);
    }
    const newValue = amount + delta;
    const maxAmount = cardConfig.maxAmount as number;
    const minAmount = cardConfig.minAmount as number;
    // eslint-disable-next-line no-nested-ternary
    const newAmount = newValue > maxAmount ? maxAmount : newValue < minAmount ? minAmount : newValue;
    setAmount(parseFloat(newAmount.toFixed(2)));
  };
  const changeAmount = (delta: number) => (hasFixedDenoms ? changeFixedAmount(delta) : changeVariableAmount(delta));
  return (
    <div className="amount-page">
      <div className="amount-page__title">
        <div className="amount-page__merchant-name">{cardConfig.displayName}</div>
        {hasDiscount ? <div className="amount-page__promo">3% Off Each Purchase</div> : null}
      </div>
      <div className="amount-page__amount-box__wrapper">
        <div className="amount-page__amount-box">
          <div className="amount-page__amount-box__currency">USD</div>
          <div className="amount-page__amount-box__amount">
            <img src="../../assets/icons/minus-icon.png" alt="minus" onClick={() => changeAmount(-0.01)} />
            <div className="amount-page__amount-box__amount__value">{amount}</div>
            <img src="../../assets/icons/plus-icon.png" alt="minus" onClick={() => changeAmount(0.01)} />
          </div>
          <div className="amount-page__amount-box__denoms">
            <CardDenoms cardConfig={cardConfig} />
          </div>
        </div>
      </div>
      <div className="amount-page__cta">
        {hasDiscount ? (
          <Link
            className="action-button"
            to={{
              pathname: `/payment/${cardConfig.name}`,
              state: {
                amount: 1,
                currency: 'USD'
              }
            }}
          >
            Continue
          </Link>
        ) : (
          <PayWithBitpay invoiceParams={{ ...invoiceParams, amount }} history={history} />
        )}
      </div>
    </div>
  );
};

export default Amount;
