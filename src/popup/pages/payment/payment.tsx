import React, { useState } from 'react';
import { browser } from 'webextension-polyfill-ts';
import { createBitPayInvoice, redeemGiftCard } from '../../../services/gift-card';
import { get, set } from '../../../services/storage';
import { GiftCard } from '../../../services/gift-card.types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Payment: React.FC<any> = ({ match: { params }, location, history }) => {
  const [awaitingPayment, setAwaitingPayment] = useState(false);
  const amount = location.state.amount as number;
  const currency = location.state.currency as string;
  const saveGiftCard = async (card: GiftCard): Promise<void> => {
    const purchasedGiftCards = (await get<GiftCard[]>('purchasedGiftCards')) || [];
    await set<GiftCard[]>('purchasedGiftCards', [...purchasedGiftCards, card]);
  };
  const showCard = (card: GiftCard): void => {
    history.goBack();
    history.goBack();
    history.goBack();
    history.push(`/wallet`);
    history.push({ pathname: `/card/${card.invoiceId}`, state: { card } });
  };
  const launchInvoice = async (): Promise<void> => {
    const clientId = await get<string>('clientId');
    const { invoiceId, accessKey, totalDiscount } = await createBitPayInvoice({
      brand: params.brand,
      currency,
      amount,
      clientId,
      discounts: [],
      email: 'satoshi@nakamoto.com'
    });
    setAwaitingPayment(true);
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
      clientId,
      accessKey,
      invoiceId,
      name: params.brand,
      totalDiscount
    });
    await saveGiftCard(giftCard);
    showCard(giftCard);
  };
  return (
    <div>
      <div>{params.brand}</div>
      <div>
        Pay me ${amount} {currency}:
      </div>
      {!awaitingPayment ? (
        <button type="button" onClick={launchInvoice}>
          Pay with BitPay
        </button>
      ) : (
        <div>Awaiting payment...</div>
      )}
    </div>
  );
};

export default Payment;
