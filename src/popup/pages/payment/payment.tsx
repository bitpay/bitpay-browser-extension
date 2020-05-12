/* eslint-disable jsx-a11y/no-autofocus */
import React, { useRef, useEffect, useState, Dispatch, SetStateAction } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import PayWithBitpay from '../../components/pay-with-bitpay/pay-with-bitpay';
import { GiftCardInvoiceParams, CardConfig, UnsoldGiftCard, GiftCard } from '../../../services/gift-card.types';
import LineItems from '../../components/line-items/line-items';
import CardHeader from '../../components/card-header/card-header';
import { resizeToFitPage } from '../../../services/frame';
import { BitpayUser } from '../../../services/bitpay-id';
import { Merchant } from '../../../services/merchant';
import './payment.scss';
import { trackComponent } from '../../../services/analytics';

const Payment: React.FC<RouteComponentProps & {
  user?: BitpayUser;
  setEmail: Dispatch<SetStateAction<string>>;
  purchasedGiftCards: GiftCard[];
  setPurchasedGiftCards: Dispatch<SetStateAction<GiftCard[]>>;
  supportedMerchant?: Merchant;
}> = ({ location, history, user, setEmail, purchasedGiftCards, setPurchasedGiftCards, supportedMerchant }) => {
  const ref = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const { amount, invoiceParams, cardConfig } = location.state as {
    amount: number;
    invoiceParams: GiftCardInvoiceParams;
    cardConfig: CardConfig;
  };

  const [email, setReceiptEmail] = useState(invoiceParams.email || '');
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
          supportedMerchant={supportedMerchant}
        />
      </div>
    </div>
  );
};

export default trackComponent(Payment, { page: 'payment' });
