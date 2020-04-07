import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { browser } from 'webextension-polyfill-ts';
import { GiftCard, CardConfig, GiftCardInvoiceParams } from '../../../services/gift-card.types';
import './pay-with-bitpay.scss';
import { get, set } from '../../../services/storage';
import { createBitPayInvoice, redeemGiftCard, getBitPayInvoice } from '../../../services/gift-card';
import Snack from '../snack/snack';

const PayWithBitpay: React.FC<Partial<RouteComponentProps> & {
  cardConfig: CardConfig;
  invoiceParams: GiftCardInvoiceParams;
  setEmail?: (email: string) => void;
  setPurchasedGiftCards: (cards: GiftCard[]) => void;
}> = ({ cardConfig, invoiceParams, history, setEmail, setPurchasedGiftCards }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [awaitingPayment, setAwaitingPayment] = useState(false);
  const { amount, currency } = invoiceParams;
  const saveGiftCard = async (card: GiftCard): Promise<void> => {
    const purchasedGiftCards = (await get<GiftCard[]>('purchasedGiftCards')) || [];
    const newPurchasedGiftCards = [...purchasedGiftCards, card];
    setPurchasedGiftCards(newPurchasedGiftCards);
    await set<GiftCard[]>('purchasedGiftCards', newPurchasedGiftCards);
  };
  const showCard = (card: GiftCard): void => {
    if (!history) return;
    history.goBack();
    history.goBack();
    history.push(`/wallet`);
    history.push({ pathname: `/card/${card.invoiceId}`, state: { card, cardConfig } });
  };
  const launchInvoice = async (): Promise<void> => {
    setAwaitingPayment(true);
    const { invoiceId, accessKey, totalDiscount } = await createBitPayInvoice(invoiceParams);
    if (setEmail) {
      await set<string>('email', invoiceParams.email as string);
      setEmail(invoiceParams.email as string);
    }
    const res = await browser.runtime.sendMessage({
      name: 'LAUNCH_INVOICE',
      invoiceId
    });
    if (res.data.status === 'closed') {
      setAwaitingPayment(false);
      return;
    }
    const [invoice, giftCard] = await Promise.all([
      getBitPayInvoice(invoiceId),
      redeemGiftCard({
        currency,
        date: new Date().toISOString(),
        amount,
        clientId: invoiceParams.clientId,
        accessKey,
        invoiceId,
        name: invoiceParams.brand,
        totalDiscount
      })
    ]);
    const finalGiftCard = {
      ...giftCard,
      discounts: cardConfig.discounts,
      invoice
    } as GiftCard;
    await saveGiftCard(finalGiftCard);
    showCard(finalGiftCard);
  };
  return (
    <>
      <div className="pay-with-bitpay">
        <Snack message={errorMessage} onClose={(): void => setErrorMessage('')} />
        {awaitingPayment ? (
          <>
            <div className="action-button action-button--light awaiting-payment" style={{ marginTop: '15px' }}>
              <img src="../../assets/icons/spinner.svg" alt="spinner" /> Awaiting Payment
            </div>
          </>
        ) : (
          <button
            className={`${invoiceParams.email ? '' : 'disabled'}`}
            type="button"
            onClick={(): Promise<void> =>
              launchInvoice().catch(err => {
                setErrorMessage(err.message || 'An unexpected error occurred');
                setAwaitingPayment(false);
              })
            }
            disabled={!invoiceParams.email}
          >
            <img src="../../assets/pay-with-bitpay.svg" alt="Pay with BitPay" />
          </button>
        )}
      </div>
    </>
  );
};

export default PayWithBitpay;
