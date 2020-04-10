import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './amount.scss';
import Anime, { AnimeValue } from 'react-anime';
import CardDenoms from '../../components/card-denoms/card-denoms';
import PayWithBitpay from '../../components/pay-with-bitpay/pay-with-bitpay';
import { GiftCardInvoiceParams, CardConfig } from '../../../services/gift-card.types';
import { getPrecision } from '../../../services/currency';
import { formatDiscount } from '../../../services/merchant';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AmountInput: React.FC<any> = ({ amount, setAmount, minAmount, maxAmount, cardConfig, hasFixedDenoms }) => {
  const [rawInput, setRawInput] = useState('0');
  const [inputError, setInputError] = useState(false);
  const handleInput = (input: string): void => {
    const newAmount = parseFloat(Number(input).toFixed(getPrecision(cardConfig.currency)));
    if (input.endsWith('.') || input.endsWith('.0')) return setRawInput(input);
    if (newAmount >= minAmount && newAmount <= maxAmount) {
      setAmount(newAmount);
      setRawInput(newAmount.toString());
    } else if (newAmount === 0) {
      setAmount(0);
      setRawInput('0');
    } else {
      setInputError(true);
      setRawInput(amount.toString());
      setTimeout((): void => {
        setInputError(false);
      }, 325);
    }
  };
  const xAmp = 12;
  const wiggleFrames = [
    { value: xAmp * -1 },
    { value: xAmp },
    { value: xAmp / -2 },
    { value: xAmp / 2 },
    { value: 0 }
  ] as AnimeValue[];
  return (
    <>
      {!hasFixedDenoms && (
        <input
          value={rawInput}
          onChange={(e: React.FormEvent<HTMLInputElement>): void => handleInput(e.currentTarget.value)}
          onBlur={(e: React.FormEvent<HTMLInputElement>): void => e.currentTarget.focus()}
          className="amount-page__input"
          placeholder="0"
          type="text"
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
        />
      )}
      <Anime duration={325} easing="easeInOutSine" translateX={inputError ? wiggleFrames : [0, 0]}>
        {hasFixedDenoms ? amount : rawInput}
      </Anime>
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Amount: React.FC<any> = ({ location, clientId, email, history, setPurchasedGiftCards }) => {
  const { cardConfig } = location.state as { cardConfig: CardConfig };
  const hasFixedDenoms = cardConfig.supportedAmounts && cardConfig.supportedAmounts[0];
  const initialAmount =
    cardConfig.supportedAmounts && cardConfig.supportedAmounts[0] ? cardConfig.supportedAmounts[0] : 0;
  const [amount, setAmount] = useState(initialAmount);
  const discount = (cardConfig.discounts || [])[0];
  const invoiceParams: GiftCardInvoiceParams = {
    brand: cardConfig.name,
    currency: cardConfig.currency,
    amount: initialAmount,
    clientId,
    discounts: discount ? [discount.code] : [],
    email
  };
  const baseDelta = getPrecision(cardConfig.currency) === 2 ? 0.01 : 1;
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
    setAmount(parseFloat(newAmount.toFixed(getPrecision(cardConfig.currency))));
  };
  const changeAmount = (delta: number): void =>
    hasFixedDenoms ? changeFixedAmount(delta) : changeVariableAmount(delta);
  return (
    <div className="amount-page">
      <div className="amount-page__title">
        <div className="amount-page__merchant-name">{cardConfig.displayName}</div>
        {discount && (
          <div className="amount-page__promo">{formatDiscount(discount, cardConfig.currency)} Off Each Purchase</div>
        )}
      </div>
      <div className="amount-page__amount-box__wrapper">
        <div className="amount-page__amount-box">
          <div className="amount-page__amount-box__currency">{cardConfig.currency}</div>
          <div className="amount-page__amount-box__amount">
            <button type="button" onClick={(): void => changeAmount(-baseDelta)}>
              <img src="../../assets/icons/decrement-icon.svg" alt="minus" />
            </button>
            <div
              className="amount-page__amount-box__amount__value"
              style={{ color: amount === 0 ? '#DFDFDF' : 'inherit' }}
            >
              <AmountInput
                amount={amount}
                setAmount={setAmount}
                minAmount={minAmount}
                maxAmount={maxAmount}
                cardConfig={cardConfig}
                hasFixedDenoms={hasFixedDenoms}
              />
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
          />
        )}
      </div>
    </div>
  );
};

export default Amount;
