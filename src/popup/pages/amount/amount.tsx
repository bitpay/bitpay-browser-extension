import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './amount.scss';
import CardDenoms from '../../components/card-denoms/card-denoms';
import PayWithBitpay from '../../components/pay-with-bitpay/pay-with-bitpay';
import { GiftCardInvoiceParams, CardConfig } from '../../../services/gift-card.types';
import { formatDiscount } from '../../../services/merchant';
import { getCardPrecision } from '../../../services/gift-card';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Amount: React.FC<any> = ({ location, clientId, email, history, setPurchasedGiftCards }) => {
  const { cardConfig } = location.state as { cardConfig: CardConfig };
  const hasFixedDenoms = cardConfig.supportedAmounts && cardConfig.supportedAmounts[0];
  const initialAmount =
    cardConfig.supportedAmounts && cardConfig.supportedAmounts[0] ? cardConfig.supportedAmounts[0] : 0;
  const [amount, setAmount] = useState(initialAmount);
  const [inputValue, setInputValue] = useState('');
  const discount = (cardConfig.discounts || [])[0];
  const invoiceParams: GiftCardInvoiceParams = {
    brand: cardConfig.name,
    currency: cardConfig.currency,
    amount: initialAmount,
    clientId,
    discounts: discount ? [discount.code] : [],
    email
  };
  const precision = getCardPrecision(cardConfig);
  const baseDelta = precision === 2 ? 0.01 : 1;
  const maxAmount = cardConfig.maxAmount as number;
  const minAmount = cardConfig.minAmount as number;
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
    // eslint-disable-next-line no-nested-ternary
    const newAmount = newValue > maxAmount ? maxAmount : newValue < minAmount ? minAmount : newValue;
    setAmount(parseFloat(newAmount.toFixed(precision)));
    setInputValue(`${newAmount.toFixed(precision)}`);
  };
  const changeAmount = (delta: number): void =>
    hasFixedDenoms ? changeFixedAmount(delta) : changeVariableAmount(delta);

  const [inputError, setInputError] = useState(false);
  const shakeInput = (): void => {
    setInputError(true);
    setTimeout((): void => {
      setInputError(false);
    }, 900);
  };
  const enforcePrecision = (value: string): string => {
    const [integer, decimal] = value.split('.');
    if (!decimal) {
      return precision === 0 ? integer : value;
    }
    const newDecimal = decimal.length > precision ? decimal.substring(0, precision) : decimal;
    return [integer, newDecimal].join('.');
  };
  const handleInput = (input: string): void => {
    const stringValue = input;
    const newAmount = parseFloat(Number(input).toFixed(precision));
    if (newAmount <= maxAmount) {
      const correctedValue = enforcePrecision(stringValue);
      if (correctedValue !== stringValue) shakeInput();
      setInputValue(correctedValue);
      setAmount(newAmount);
    } else if (newAmount === 0) {
      setInputValue('0');
      setAmount(0);
    } else {
      shakeInput();
    }
  };
  return (
    <div className="amount-page">
      <div className="amount-page__title">
        <div className="amount-page__merchant-name">{cardConfig.displayName}</div>
        {discount && (
          <div className="amount-page__promo">{formatDiscount(discount, cardConfig.currency)} Off Each Purchase</div>
        )}
      </div>
      <div className="amount-page__amount-box__wrapper">
        {!hasFixedDenoms && (
          <input
            value={inputValue}
            onChange={(e: React.FormEvent<HTMLInputElement>): void => handleInput(e.currentTarget.value)}
            onBlur={(e: React.FormEvent<HTMLInputElement>): void => e.currentTarget.focus()}
            className="amount-page__input"
            placeholder="0"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          />
        )}
        <div className="amount-page__amount-box">
          <div className="amount-page__amount-box__currency">{cardConfig.currency}</div>
          <div className="amount-page__amount-box__amount">
            <button type="button" onClick={(): void => changeAmount(-baseDelta)}>
              <img src="../../assets/icons/decrement-icon.svg" alt="minus" />
            </button>
            <div
              className={`amount-page__amount-box__amount__value${inputError ? ' wiggle-animation' : ''}`}
              style={{ color: amount === 0 ? '#DFDFDF' : 'inherit' }}
            >
              {cardConfig.maxAmount ? inputValue || '0' : amount}
            </div>
            <button type="button" onClick={(): void => changeAmount(baseDelta)}>
              <img src="../../assets/icons/increment-icon.svg" alt="minus" />
            </button>
          </div>
          <div className="amount-page__amount-box__denoms">
            <CardDenoms cardConfig={cardConfig} />
          </div>
        </div>
      </div>
      <div className="amount-page__cta">
        {(cardConfig.activationFees && cardConfig.activationFees.length) || discount || !email ? (
          <div className="action-button__footer" style={{ marginTop: 0 }}>
            <Link
              className="action-button"
              to={{
                pathname: `/payment/${cardConfig.name}`,
                state: {
                  amount,
                  cardConfig,
                  invoiceParams
                }
              }}
            >
              Continue
            </Link>
          </div>
        ) : (
          <PayWithBitpay
            invoiceParams={{ ...invoiceParams, amount }}
            cardConfig={cardConfig}
            history={history}
            setPurchasedGiftCards={setPurchasedGiftCards}
            onInvalidParams={(): void => shakeInput()}
          />
        )}
      </div>
    </div>
  );
};

export default Amount;
