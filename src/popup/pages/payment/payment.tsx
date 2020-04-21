/* eslint-disable jsx-a11y/no-autofocus */
import React, { useRef, useEffect, useState } from 'react';
import PayWithBitpay from '../../components/pay-with-bitpay/pay-with-bitpay';
import { GiftCardInvoiceParams, CardConfig, UnsoldGiftCard } from '../../../services/gift-card.types';
import LineItems from '../../components/line-items/line-items';
import CardHeader from '../../components/card-header/card-header';
import { resizeToFitPage } from '../../../services/frame';
import './payment.scss';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Payment: React.FC<any> = ({ location, history, user, setEmail, purchasedGiftCards, setPurchasedGiftCards }) => {
  const ref = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const amount = location.state.amount as number;
  const invoiceParams = location.state.invoiceParams as GiftCardInvoiceParams;
  const [email, setReceiptEmail] = useState(invoiceParams.email || '');
  const cardConfig = location.state.cardConfig as CardConfig;
  const card: UnsoldGiftCard = {
    amount,
    currency: invoiceParams.currency,
    name: cardConfig.name,
    discounts: cardConfig.discounts
  };
  const shouldShowLineItems = !!(
    (cardConfig.discounts && cardConfig.discounts.length) ||
    (cardConfig.activationFees && cardConfig.activationFees.length)
  );
  const onEmailChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    emailRef.current?.validity.valid ? setReceiptEmail(event.target.value) : setReceiptEmail('');
  };
  useEffect(() => {
    resizeToFitPage(ref, 77, 100);
  }, [ref]);
  return (
    <div className="payment">
      <div ref={ref}>
        <CardHeader cardConfig={cardConfig} card={card} />
        {shouldShowLineItems && <LineItems cardConfig={cardConfig} card={card} />}
        {!invoiceParams.email && !user && (
          <div className="settings-group">
            <div className="settings-group__label">Email</div>
            <div className="settings-group__input">
              <input type="email" placeholder="satoshi@bitpay.com" autoFocus onChange={onEmailChange} ref={emailRef} />
            </div>
            <div className="settings-group__caption">Email used for purchase receipts and communication</div>
          </div>
        )}
        <PayWithBitpay
          invoiceParams={{ ...invoiceParams, amount, email }}
          cardConfig={cardConfig}
          history={history}
          user={user}
          setEmail={setEmail}
          purchasedGiftCards={purchasedGiftCards}
          setPurchasedGiftCards={setPurchasedGiftCards}
        />
      </div>
    </div>
  );
};

export default Payment;
