import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { browser } from 'webextension-polyfill-ts';
import { GiftCard, CardConfig, GiftCardInvoiceParams } from '../../../services/gift-card.types';
import './pay-with-bitpay.scss';
import { set } from '../../../services/storage';
import { createBitPayInvoice, redeemGiftCard, getBitPayInvoice } from '../../../services/gift-card';
import Snack from '../snack/snack';
import { waitForServerEvent, deleteCard } from '../../../services/gift-card-storage';
import { wait } from '../../../services/utils';

const PayWithBitpay: React.FC<Partial<RouteComponentProps> & {
  cardConfig: CardConfig;
  invoiceParams: GiftCardInvoiceParams;
  setEmail?: (email: string) => void;
  purchasedGiftCards: GiftCard[];
  setPurchasedGiftCards: (cards: GiftCard[]) => void;
  onInvalidParams?: () => void;
}> = ({
  cardConfig,
  invoiceParams,
  history,
  setEmail,
  purchasedGiftCards,
  setPurchasedGiftCards,
  onInvalidParams = (): void => undefined
}) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [awaitingPayment, setAwaitingPayment] = useState(false);
  const { amount, currency } = invoiceParams;
  const saveGiftCard = async (card: GiftCard): Promise<void> => {
    const newPurchasedGiftCards = [...purchasedGiftCards, card];
    setPurchasedGiftCards(newPurchasedGiftCards);
    await set<GiftCard[]>('purchasedGiftCards', newPurchasedGiftCards);
  };
  const deleteGiftCard = async (card: GiftCard): Promise<void> => {
    const newCards = await deleteCard(card, purchasedGiftCards);
    setPurchasedGiftCards(newCards);
  };
  const showCard = (card: GiftCard): void => {
    if (!history) return;
    history.goBack();
    history.goBack();
    history.push(`/wallet`);
    history.push({ pathname: `/card/${card.invoiceId}`, state: { card, cardConfig } });
  };
  const isAmountValid = (): boolean => {
    const maxAmount = cardConfig.maxAmount as number;
    const minAmount = cardConfig.minAmount as number;
    return cardConfig.supportedAmounts ? true : amount <= maxAmount && amount >= minAmount;
  };
  const launchInvoice = async (): Promise<void> => {
    if (!isAmountValid()) {
      return onInvalidParams();
    }
    setAwaitingPayment(true);
    const { invoiceId, accessKey, totalDiscount } = await createBitPayInvoice(invoiceParams);
    if (setEmail) {
      await set<string>('email', invoiceParams.email as string);
      setEmail(invoiceParams.email as string);
    }
    const unredeemedGiftCard = {
      currency,
      date: new Date().toISOString(),
      amount,
      clientId: invoiceParams.clientId,
      accessKey,
      invoiceId,
      name: invoiceParams.brand,
      totalDiscount,
      status: 'UNREDEEMED'
    } as GiftCard;
    await saveGiftCard(unredeemedGiftCard);
    const launchPromise = browser.runtime.sendMessage({
      name: 'LAUNCH_INVOICE',
      invoiceId
    });
    const res = await Promise.race([
      launchPromise,
      waitForServerEvent(unredeemedGiftCard).catch(async () => {
        await wait(1000 * 60 * 15);
        Promise.resolve({ data: { status: 'closed' } });
      })
    ]);
    if (res.data && res.data.status === 'closed') {
      await deleteGiftCard(unredeemedGiftCard);
      setAwaitingPayment(false);
      return;
    }
    const [invoice, giftCard] = await Promise.all([getBitPayInvoice(invoiceId), redeemGiftCard(unredeemedGiftCard)]);
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
            <div className="action-button action-button--light awaiting-payment">
              <img className="action-button__spinner" src="../../assets/icons/spinner.svg" alt="spinner" /> Awaiting
              Payment
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
