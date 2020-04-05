/* eslint-disable jsx-a11y/no-autofocus */
import React, { useRef, useEffect, useState } from 'react';
import PayWithBitpay from '../../components/pay-with-bitpay/pay-with-bitpay';
import { GiftCardInvoiceParams, CardConfig, UnsoldGiftCard } from '../../../services/gift-card.types';
import LineItems from '../../components/line-items/line-items';
import CardHeader from '../../components/card-header/card-header';
import './payment.scss';
import { resizeToFitPage } from '../../../services/frame';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Payment: React.FC<any> = ({ location, history, setEmail, setPurchasedGiftCards }) => {
  const ref = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setReceiptEmail] = useState('');

  useEffect(() => {
    resizeToFitPage(ref, 77);
  }, [ref]);
  const amount = location.state.amount as number;
  const invoiceParams = location.state.invoiceParams as GiftCardInvoiceParams;
  const cardConfig = location.state.cardConfig as CardConfig;
  const card: UnsoldGiftCard = {
    amount,
    currency: invoiceParams.currency,
    name: cardConfig.name,
    discounts: cardConfig.discounts
  };
  const onEmailChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    emailRef.current?.validity.valid ? setReceiptEmail(event.target.value) : setReceiptEmail('');
  };
  return (
    <div className="payment">
      <div ref={ref}>
        <CardHeader cardConfig={cardConfig} card={card} />
        {cardConfig.discounts && cardConfig.discounts.length ? <LineItems cardConfig={cardConfig} card={card} /> : null}
        <div className="input-group">
          <div className="input-group__label">Email</div>
          <div className="input-group__input">
            <input type="email" placeholder="satoshi@bitpay.com" autoFocus onChange={onEmailChange} ref={emailRef} />
          </div>
          <div className="input-group__caption">Email used for purchase receipts and communication</div>
        </div>
        <PayWithBitpay
          invoiceParams={{ ...invoiceParams, amount, email }}
          cardConfig={cardConfig}
          history={history}
          setEmail={setEmail}
          setPurchasedGiftCards={setPurchasedGiftCards}
        />
      </div>
    </div>
  );
};

export default Payment;
