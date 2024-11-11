/* eslint-disable jsx-a11y/no-autofocus */
import React, { useRef, useEffect, useState, Dispatch, SetStateAction } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PayWithBitpay from '../../components/pay-with-bitpay/pay-with-bitpay';
import { GiftCardInvoiceParams, CardConfig, UnsoldGiftCard, GiftCard } from '../../../services/gift-card.types';
import LineItems from '../../components/line-items/line-items';
import CardHeader from '../../components/card-header/card-header';
import { resizeToFitPage } from '../../../services/frame';
import { BitpayUser } from '../../../services/bitpay-id';
import { Merchant } from '../../../services/merchant';
import { trackComponent } from '../../../services/analytics';
import './payment.scss';

const Payment: React.FC<RouteComponentProps & {
  user?: BitpayUser;
  setEmail: Dispatch<SetStateAction<string>>;
  purchasedGiftCards: GiftCard[];
  setPurchasedGiftCards: Dispatch<SetStateAction<GiftCard[]>>;
  supportedMerchant?: Merchant;
  initiallyCollapsed: boolean;
}> = ({
  location,
  history,
  user,
  setEmail,
  purchasedGiftCards,
  setPurchasedGiftCards,
  supportedMerchant,
  initiallyCollapsed
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const { amount, invoiceParams, cardConfig, isFirstPage } = location.state as {
    amount: number;
    invoiceParams: GiftCardInvoiceParams;
    cardConfig: CardConfig;
    isFirstPage: boolean;
  };

  const [email, setReceiptEmail] = useState(invoiceParams.email || '');
  const card: UnsoldGiftCard = {
    amount,
    currency: invoiceParams.currency,
    name: cardConfig.name,
    coupons: cardConfig.coupons
  };
  const shouldShowLineItems = !!(
    (cardConfig.coupons && cardConfig.coupons.length) ||
    (cardConfig.activationFees && cardConfig.activationFees.length)
  );
  const onEmailChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    emailRef.current?.validity.valid ? setReceiptEmail(event.target.value) : setReceiptEmail('');
  };
  useEffect(() => {
    if (initiallyCollapsed && isFirstPage) return;
    resizeToFitPage(ref, 71, 100);
  }, [ref, initiallyCollapsed, isFirstPage]);
  return (
    <div className="payment">
      <div ref={ref}>
        <AnimatePresence initial={false}>
          <CardHeader cardConfig={cardConfig} card={card} />
          {shouldShowLineItems && <LineItems cardConfig={cardConfig} card={card} />}
        </AnimatePresence>
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
