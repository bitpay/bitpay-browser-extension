import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { browser } from 'webextension-polyfill-ts';
import { GiftCard, CardConfig, GiftCardInvoiceParams } from '../../../services/gift-card.types';
import './pay-with-bitpay.scss';
import { get, set } from '../../../services/storage';
import { createBitPayInvoice, redeemGiftCard, getBitPayInvoice } from '../../../services/gift-card';

const PayWithBitpay: React.FC<Partial<RouteComponentProps> & {
  cardConfig: CardConfig;
  invoiceParams: GiftCardInvoiceParams;
  updatePurchasedGiftCards: (cards: GiftCard[]) => void;
}> = ({ cardConfig, invoiceParams, history, updatePurchasedGiftCards }) => {
  const [awaitingPayment, setAwaitingPayment] = useState(false);
  const { amount, currency } = invoiceParams;
  console.log('invoiceParams', invoiceParams);
  const saveGiftCard = async (card: GiftCard): Promise<void> => {
    const purchasedGiftCards = (await get<GiftCard[]>('purchasedGiftCards')) || [];
    const newPurchasedGiftCards = [...purchasedGiftCards, card];
    updatePurchasedGiftCards(newPurchasedGiftCards);
    await set<GiftCard[]>('purchasedGiftCards', newPurchasedGiftCards);
  };
  const showCard = (card: GiftCard): void => {
    if (!history) return;
    history.goBack();
    history.goBack();
    // history.goBack();
    history.push(`/wallet`);
    history.push({ pathname: `/card/${card.invoiceId}`, state: { card, cardConfig } });
  };
  const launchInvoice = async (): Promise<void> => {
    setAwaitingPayment(true);
    const { invoiceId, accessKey, totalDiscount } = await createBitPayInvoice(invoiceParams);
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
    console.log('invoice', invoice);
    const finalGiftCard = {
      ...giftCard,
      invoice
    } as GiftCard;
    await saveGiftCard(finalGiftCard);
    showCard(finalGiftCard);
  };
  return (
    <>
      <div className="pay-with-bitpay">
        {awaitingPayment ? (
          <>
            <div className="action-button action-button--light awaiting-payment">
              <img src="../../assets/icons/spinner.svg" alt="spinner" /> Awaiting Payment
            </div>
          </>
        ) : (
          <button type="button" onClick={launchInvoice}>
            <img src="../../assets/pay-with-bitpay.svg" alt="Pay with BitPay" />
          </button>
        )}
      </div>
    </>
  );
};

export default PayWithBitpay;
