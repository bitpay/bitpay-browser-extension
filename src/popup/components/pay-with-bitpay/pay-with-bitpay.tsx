/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { useState } from 'react';
import { browser } from 'webextension-polyfill-ts';
import { GiftCard } from '../../../services/gift-card.types';
import './pay-with-bitpay.scss';
import { get, set } from '../../../services/storage';
import { createBitPayInvoice, redeemGiftCard } from '../../../services/gift-card';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PayWithBitpay: React.FC<any> = ({ invoiceParams, history }) => {
  const [awaitingPayment, setAwaitingPayment] = useState(false);
  const { amount, currency } = invoiceParams;
  console.log('invoiceParams', invoiceParams);
  const saveGiftCard = async (card: GiftCard): Promise<void> => {
    const purchasedGiftCards = (await get<GiftCard[]>('purchasedGiftCards')) || [];
    await set<GiftCard[]>('purchasedGiftCards', [...purchasedGiftCards, card]);
  };
  const showCard = (card: GiftCard): void => {
    history.goBack();
    history.goBack();
    // history.goBack();
    history.push(`/wallet`);
    history.push({ pathname: `/card/${card.invoiceId}`, state: { card } });
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
    const giftCard = await redeemGiftCard({
      currency,
      date: new Date().toISOString(),
      amount,
      clientId: invoiceParams.clientId,
      accessKey,
      invoiceId,
      name: invoiceParams.brand,
      totalDiscount
    });
    await saveGiftCard(giftCard);
    showCard(giftCard);
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
          // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events
          <img src="../../assets/pay-with-bitpay.svg" alt="Pay with BitPay" onClick={launchInvoice} />
        )}
      </div>
    </>
  );
};

export default PayWithBitpay;
