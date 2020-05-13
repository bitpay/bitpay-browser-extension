import React, { useRef, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Tooltip, makeStyles, createStyles } from '@material-ui/core';
import { useTracking } from 'react-tracking';
import { motion } from 'framer-motion';
import { upperCut } from '../../../services/animations';
import { GiftCard, CardConfig } from '../../../services/gift-card.types';
import { wait } from '../../../services/utils';
import { resizeToFitPage } from '../../../services/frame';
import { launchNewTab } from '../../../services/browser';
import { redeemGiftCard, getLatestBalance } from '../../../services/gift-card';
import LineItems from '../../components/line-items/line-items';
import CardHeader from '../../components/card-header/card-header';
import CodeBox from '../../components/code-box/code-box';
import CardMenu from '../../components/card-menu/card-menu';
import ActionButton from '../../components/action-button/action-button';
import { trackComponent } from '../../../services/analytics';
import './card.scss';

const Card: React.FC<RouteComponentProps & {
  purchasedGiftCards: GiftCard[];
  updateGiftCard: (card: GiftCard) => void;
}> = ({ location, history, purchasedGiftCards, updateGiftCard }) => {
  const tracking = useTracking();
  const useStyles = makeStyles(() =>
    createStyles({
      tooltipStyles: {
        borderRadius: '6px',
        color: 'white',
        backgroundColor: '#303133',
        maxWidth: 200,
        padding: '12px 15px',
        fontWeight: 400,
        fontSize: '11px',
        textAlign: 'center',
        top: '10px'
      }
    })
  );
  const classes = useStyles();
  const tooltipStyles = { tooltip: classes.tooltipStyles };
  const ref = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);
  const { card: giftCard, cardConfig } = location.state as { card: GiftCard; cardConfig: CardConfig };
  const { invoiceId } = giftCard;
  const [card, setCard] = useState(giftCard);
  const [fetchingClaimCode, setFetchingClaimCode] = useState(false);
  const initiallyArchived = giftCard.archived;
  const redeemUrl = `${cardConfig.redeemUrl}${card.claimCode}`;
  const launchClaimLink = (): void => {
    const url = cardConfig.defaultClaimCodeType === 'link' ? (card.claimLink as string) : redeemUrl;
    launchNewTab(url);
    tracking.trackEvent({
      action: 'clickedRedeemButton',
      gaAction: `clickedRedeemButton:${cardConfig.name}`,
      brand: cardConfig.name
    });
  };
  const shouldShowRedeemButton = (): boolean => !!(cardConfig.redeemUrl || cardConfig.defaultClaimCodeType === 'link');
  const updateCard = async (cardToUpdate: GiftCard): Promise<void> => {
    updateGiftCard(cardToUpdate);
    setCard(cardToUpdate);
  };
  const resizeFrame = (paddingBottom = 60): void => {
    if (mountedRef.current) resizeToFitPage(ref, paddingBottom);
  };
  const archive = async (): Promise<void> => {
    await updateCard({ ...card, archived: true });
    initiallyArchived ? resizeFrame() : history.goBack();
    tracking.trackEvent({ action: 'archivedGiftCard' });
  };
  const unarchive = async (): Promise<void> => {
    updateGiftCard(card);
    resizeFrame();
    updateCard({ ...card, archived: false });
    tracking.trackEvent({ action: 'unarchivedGiftCard' });
  };
  const menuItems = ['Edit Balance', card.archived ? 'Unarchive' : 'Archive', 'Help'];
  const handleMenuClick = (item: string): void => {
    switch (item) {
      case 'Edit Balance':
        history.push({
          pathname: `/card/${card.invoiceId}/balance`,
          state: { card, cardConfig, updateType: 'Amount Spent' }
        });
        break;
      case 'Archive':
        archive();
        break;
      case 'Unarchive':
        unarchive();
        break;
      case 'Help':
        tracking.trackEvent({ action: 'clickedHelp' });
        return launchNewTab('https://bitpay.com/request-help');
      default:
        console.log('Unknown Menu Option Selected');
    }
  };
  const handleErrorButtonClick = (): void => {
    const hasValidPayment = card.invoice && ['paid', 'confirmed', 'complete'].includes(card.invoice.status);
    hasValidPayment || !card.invoice ? handleMenuClick('Help') : launchNewTab(card.invoice.url);
  };
  const redeem = async (): Promise<void> => {
    setFetchingClaimCode(true);
    const updatedGiftCard = await redeemGiftCard(card);
    if (!mountedRef.current) return;
    if (updatedGiftCard.status === 'PENDING') {
      await wait(700);
    }
    setFetchingClaimCode(false);
    const fullCard = { ...card, ...updatedGiftCard };
    await updateCard(fullCard);
    resizeFrame();
  };
  useEffect(() => {
    const updatedCard = purchasedGiftCards.find(c => c.invoiceId === invoiceId) as GiftCard;
    setCard(updatedCard);
    resizeFrame();
  }, [purchasedGiftCards, invoiceId]);
  useEffect(() => {
    resizeFrame();
  }, [ref]);
  useEffect(() => {
    const createdLessThan24HoursAgo = Date.now() - new Date(card.date).getTime() < 1000 * 60 * 60 * 24;
    if (card.status === 'PENDING' || (card.status === 'FAILURE' && createdLessThan24HoursAgo)) redeem();
    return (): void => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="card-details">
      <div className="card-details__content" ref={ref}>
        <CardMenu items={menuItems} onClick={handleMenuClick} />

        <CardHeader amount={getLatestBalance(card)} cardConfig={cardConfig} card={card} />

        <LineItems cardConfig={cardConfig} card={card} />

        {card.status === 'SUCCESS' && cardConfig.defaultClaimCodeType !== 'link' && (
          <motion.div
            variants={upperCut}
            custom={0.2}
            animate="visible"
            initial="hidden"
            className="card-details__content__code-box"
          >
            <CodeBox label="Claim Code" code={card.claimCode} />
            {card.pin && <CodeBox label="Pin" code={card.pin} />}
          </motion.div>
        )}

        {card.status === 'SUCCESS' && !card.archived && shouldShowRedeemButton() && (
          <motion.div
            variants={upperCut}
            custom={0.3}
            animate="visible"
            initial="hidden"
            className="action-button__footer"
          >
            <ActionButton onClick={launchClaimLink}>Redeem Now</ActionButton>
          </motion.div>
        )}

        {card.status === 'PENDING' && (
          <Tooltip
            title="We’ll update your claim code here when your payment confirms"
            placement="top"
            classes={tooltipStyles}
            arrow
          >
            <motion.div
              variants={upperCut}
              custom={0.3}
              animate="visible"
              initial="hidden"
              className="action-button__footer"
            >
              <ActionButton onClick={redeem} flavor="warn">
                {fetchingClaimCode ? (
                  <>
                    <img className="action-button__spinner" src="../../assets/icons/spinner-warn.svg" alt="spinner" />
                    Fetching Claim Code
                  </>
                ) : (
                  <>Pending Confirmation</>
                )}
              </ActionButton>
            </motion.div>
          </Tooltip>
        )}

        {card.status === 'FAILURE' && (
          <Tooltip
            title="Could not get claim code. Please contact BitPay Support."
            placement="top"
            classes={tooltipStyles}
            arrow
          >
            <motion.div
              variants={upperCut}
              custom={0.3}
              animate="visible"
              initial="hidden"
              className="action-button__footer"
            >
              <ActionButton onClick={handleErrorButtonClick} flavor="danger">
                Something Went Wrong
              </ActionButton>
            </motion.div>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default trackComponent(Card, { page: 'card' });
