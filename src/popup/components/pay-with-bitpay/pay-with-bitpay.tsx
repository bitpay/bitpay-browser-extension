import React, { useState, useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { browser } from 'webextension-polyfill-ts';
import { motion, AnimatePresence } from 'framer-motion';
import { useTracking } from 'react-tracking';
import { GiftCard, CardConfig, GiftCardInvoiceParams } from '../../../services/gift-card.types';
import { set } from '../../../services/storage';
import {
  createBitPayInvoice,
  redeemGiftCard,
  isAmountValid,
  getGiftCardPromoEventParams
} from '../../../services/gift-card';
import Snack from '../snack/snack';
import { waitForServerEvent, deleteCard } from '../../../services/gift-card-storage';
import { wait } from '../../../services/utils';
import { BitpayUser } from '../../../services/bitpay-id';
import { injectClaimInfo } from '../../../services/browser';
import { PayWithBitpayImage } from '../svg/pay-with-bitpay-image';
import { Merchant } from '../../../services/merchant';
import {
  buttonAnimation,
  buttonTextAnimation,
  buttonSpinnerAnimation,
  spinAnimation
} from '../../../services/animations';
import './pay-with-bitpay.scss';

const PayWithBitpay: React.FC<Partial<RouteComponentProps> & {
  cardConfig: CardConfig;
  invoiceParams: GiftCardInvoiceParams;
  setEmail?: (email: string) => void;
  user?: BitpayUser;
  purchasedGiftCards: GiftCard[];
  setPurchasedGiftCards: (cards: GiftCard[]) => void;
  supportedMerchant?: Merchant;
  onInvalidParams?: () => void;
}> = ({
  cardConfig,
  invoiceParams,
  history,
  setEmail,
  user,
  purchasedGiftCards,
  setPurchasedGiftCards,
  supportedMerchant,
  onInvalidParams = (): void => undefined
}) => {
  const tracking = useTracking();
  const [errorMessage, setErrorMessage] = useState('');
  const [awaitingPayment, setAwaitingPayment] = useState(false);
  const { amount, currency } = invoiceParams;
  const onMerchantWebsite = supportedMerchant?.name === cardConfig.name;
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
  const snackOnClose = (): void => {
    setErrorMessage('');
  };
  const payButton = (): void => {
    setAwaitingPayment(true);
    return tracking?.trackEvent({ action: 'clickedPayButton', brand: cardConfig.name });
  };
  useEffect(() => {
    if (!awaitingPayment) return;
    const launchInvoice = async (): Promise<void> => {
      if (!isAmountValid(amount, cardConfig)) {
        setAwaitingPayment(false);
        return onInvalidParams();
      }
      const { invoiceId, accessKey, totalDiscount } = await createBitPayInvoice({ params: invoiceParams, user });
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
        status: 'UNREDEEMED',
        ...(user && user.eid && { userEid: user.eid })
      } as GiftCard;
      await saveGiftCard(unredeemedGiftCard);
      const launchPromise = browser.runtime.sendMessage({
        name: 'LAUNCH_WINDOW',
        url: `${process.env.API_ORIGIN}/invoice?id=${invoiceId}&view=popup`
      });
      const res = await Promise.race([
        launchPromise.catch(() => ({ data: { status: 'error' } })),
        waitForServerEvent({ unredeemedGiftCard, user }).catch(async err => {
          console.error('Received an error while waiting for server event', err);
          await wait(1000 * 60 * 15);
          Promise.resolve({ data: { status: 'error' } });
        })
      ]);
      if (res.data && res.data.status === 'closed') {
        tracking.trackEvent({ action: 'closedInvoice', brand: cardConfig.name });
        await deleteGiftCard(unredeemedGiftCard);
        setAwaitingPayment(false);
        return;
      }
      const giftCard = await redeemGiftCard(unredeemedGiftCard);
      const transactionCurrency = giftCard.invoice?.transactionCurrency;
      tracking.trackEvent({
        action: 'purchasedGiftCard',
        gaAction: `purchasedGiftCard:${cardConfig.name}:${transactionCurrency}`,
        brand: cardConfig.name,
        transactionCurrency,
        ...(cardConfig.discounts && cardConfig.discounts[0] && { ...getGiftCardPromoEventParams(cardConfig) })
      });
      const finalGiftCard = {
        ...giftCard,
        discounts: cardConfig.discounts
      } as GiftCard;
      await saveGiftCard(finalGiftCard);
      showCard(finalGiftCard);
      if (finalGiftCard.status === 'SUCCESS' && cardConfig.cssSelectors && onMerchantWebsite) {
        injectClaimInfo(cardConfig, { claimCode: finalGiftCard.claimCode, pin: finalGiftCard.pin });
        tracking.trackEvent({
          action: 'autofilledClaimInfo',
          brand: cardConfig.name,
          gaAction: `autofilledClaimInfo:${cardConfig.name}`
        });
      }
    };
    launchInvoice().catch(err => {
      setErrorMessage(err.message || 'An unexpected error occurred');
      setAwaitingPayment(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [awaitingPayment]);
  return (
    <>
      <div className="pay-with-bitpay">
        <Snack message={errorMessage} onClose={snackOnClose} />
        <AnimatePresence exitBeforeEnter>
          {awaitingPayment ? (
            <motion.div
              className="action-button action-button--pending"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={buttonAnimation}
              key="awaiting-payment"
            >
              <motion.span className="d-flex" variants={buttonSpinnerAnimation} key="awaiting-payment-wrapper">
                <motion.img
                  className="action-button__spinner"
                  src="../../assets/icons/spinner.svg"
                  variants={spinAnimation}
                  alt="spinner"
                  key="awaiting-payment-spinner"
                />
              </motion.span>
              <motion.span variants={buttonTextAnimation} key="awaiting-payment-text">
                Awaiting Payment
              </motion.span>
            </motion.div>
          ) : (
            <motion.button
              className="pay-with-bitpay__pay-button"
              type="button"
              onClick={payButton}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={buttonAnimation}
              whileTap={{ scale: 0.98 }}
              disabled={!invoiceParams.email}
              key="pay-with-bitpay"
            >
              <PayWithBitpayImage />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default PayWithBitpay;
