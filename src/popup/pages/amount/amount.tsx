import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import CardDenoms from '../../components/card-denoms/card-denoms';
import PayWithBitpay from '../../components/pay-with-bitpay/pay-with-bitpay';
import { GiftCardInvoiceParams, CardConfig } from '../../../services/gift-card.types';
import { getCardPrecision, isAmountValid } from '../../../services/gift-card';
import DiscountText from '../../components/discount-text/discount-text';
import { Merchant } from '../../../services/merchant';
import { resizeFrame } from '../../../services/frame';
import ActionButton from '../../components/action-button/action-button';
import './amount.scss';

const shkAmp = 12;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Amount: React.FC<any> = ({
  location,
  clientId,
  email,
  initialAmount,
  user,
  history,
  purchasedGiftCards,
  setPurchasedGiftCards
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { cardConfig, merchant } = location.state as { cardConfig: CardConfig; merchant: Merchant };
  const hasFixedDenoms = cardConfig.supportedAmounts && cardConfig.supportedAmounts[0];
  const preloadedAmount =
    initialAmount ||
    (cardConfig.supportedAmounts && cardConfig.supportedAmounts[0] ? cardConfig.supportedAmounts[0] : 0);
  const [amount, setAmount] = useState(preloadedAmount);
  const [inputValue, setInputValue] = useState(preloadedAmount ? `${preloadedAmount}` : '');
  const [inputError, setInputError] = useState(false);
  const [inputDirty, setInputDirty] = useState(false);
  const discount = (cardConfig.discounts || [])[0];
  const invoiceParams: GiftCardInvoiceParams = {
    brand: cardConfig.name,
    currency: cardConfig.currency,
    amount: preloadedAmount,
    clientId,
    discounts: discount ? [discount.code] : [],
    email: (user && user.email) || email
  };
  const precision = getCardPrecision(cardConfig);
  const baseDelta = precision === 2 ? 0.01 : 1;
  const maxAmount = cardConfig.maxAmount as number;
  const minAmount = cardConfig.minAmount as number;
  const paymentPageAvailable =
    (cardConfig.activationFees && cardConfig.activationFees.length) || discount || (!email && !user);
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
  const focusInput = (): void => {
    setTimeout(() => {
      if (inputRef && inputRef.current) inputRef.current.focus();
    });
  };
  const changeAmount = (delta: number): void => {
    hasFixedDenoms ? changeFixedAmount(delta) : changeVariableAmount(delta);
    focusInput();
  };
  const shakeInput = (): void => {
    setInputError(true);
    setTimeout((): void => {
      setInputError(false);
    }, 325);
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
  const goToPaymentPage = (): void => {
    isAmountValid(amount, cardConfig)
      ? history.push({
          pathname: `/payment/${cardConfig.name}`,
          state: {
            amount,
            cardConfig,
            invoiceParams
          }
        })
      : shakeInput();
  };
  const handleKeyDown = (key: number): void => {
    if (paymentPageAvailable && key === 13) {
      goToPaymentPage();
    }
    if (!inputDirty && inputValue !== '' && key !== 8) {
      handleInput('');
    }
    setInputDirty(true);
  };
  resizeFrame(360);
  return (
    <div className="amount-page">
      <div className="amount-page__title">
        <div className="amount-page__merchant-name">{cardConfig.displayName}</div>
        {discount && (
          <div className="amount-page__promo">
            <DiscountText merchant={merchant} />
          </div>
        )}
      </div>
      <div className="amount-page__amount-box__wrapper">
        {!hasFixedDenoms && (
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e: React.FormEvent<HTMLInputElement>): void => handleInput(e.currentTarget.value)}
            onBlur={focusInput}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>): void => handleKeyDown(e.keyCode)}
            className="amount-page__input"
            placeholder="0"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          />
        )}
        <div className="amount-page__amount-box">
          <div className="amount-page__amount-box__currency">{cardConfig.currency}</div>
          <div className="amount-page__amount-box__amount">
            <motion.button whileTap={{ scale: 0.9 }} onClick={(): void => changeAmount(-baseDelta)} type="button">
              <img src="../../assets/icons/decrement-icon.svg" alt="minus" />
            </motion.button>
            <motion.div
              className="amount-page__amount-box__amount__value"
              initial={false}
              animate={{
                x: inputError ? [null, shkAmp * -1, shkAmp, shkAmp / -2, shkAmp / 2, 0] : [0, 0],
                color: amount === 0 ? '#DFDFDF' : '#000000'
              }}
              transition={{ duration: 0.325 }}
            >
              {maxAmount ? inputValue || '0' : amount}
            </motion.div>
            <motion.button whileTap={{ scale: 0.9 }} onClick={(): void => changeAmount(baseDelta)} type="button">
              <img src="../../assets/icons/increment-icon.svg" alt="minus" />
            </motion.button>
          </div>
          <div className="amount-page__amount-box__denoms">
            <CardDenoms cardConfig={cardConfig} />
          </div>
        </div>
      </div>
      <div className="amount-page__cta">
        {paymentPageAvailable ? (
          <div className="action-button__footer">
            <ActionButton onClick={goToPaymentPage}>Continue</ActionButton>
          </div>
        ) : (
          <PayWithBitpay
            invoiceParams={{ ...invoiceParams, amount }}
            cardConfig={cardConfig}
            history={history}
            purchasedGiftCards={purchasedGiftCards}
            setPurchasedGiftCards={setPurchasedGiftCards}
            onInvalidParams={(): void => shakeInput()}
          />
        )}
      </div>
    </div>
  );
};

export default Amount;
