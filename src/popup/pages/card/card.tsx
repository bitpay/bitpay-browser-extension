import React, { useRef, useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { browser } from 'webextension-polyfill-ts';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { usePopupState, bindTrigger, bindMenu } from 'material-ui-popup-state/hooks';
import { GiftCard, CardConfig } from '../../../services/gift-card.types';
import './card.scss';
import { set, get } from '../../../services/storage';
import { resizeToFitPage } from '../../../services/frame';
import LineItems from '../../components/line-items/line-items';
import CardHeader from '../../components/card-header/card-header';
import CodeBox from '../../components/code-box/code-box';

const Card: React.FC<RouteComponentProps & { setPurchasedGiftCards: (cards: GiftCard[]) => void }> = ({
  location,
  history,
  setPurchasedGiftCards
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    resizeToFitPage(ref, 80);
  }, [ref]);
  const { card, cardConfig } = location.state as { card: GiftCard; cardConfig: CardConfig };
  // const cardObj = location.state.card as GiftCard;
  // const card = { ...cardObj, discounts: [{ type: 'percentage', amount: 5 }], totalDiscount: 0.05 } as GiftCard;
  const redeemUrl = `${cardConfig.redeemUrl}${card.claimCode}`;
  const popupState = usePopupState({ variant: 'popover', popupId: 'cardActions' });
  const launchNewTab = (url: string): void => {
    browser.tabs.create({ url });
  };
  const launchClaimLink = (): void => {
    const url = cardConfig.defaultClaimCodeType === 'link' ? (card.claimLink as string) : redeemUrl;
    launchNewTab(url);
  };
  const archive = async (): Promise<void> => {
    const cards = await get<GiftCard[]>('purchasedGiftCards');
    const newCards = cards.map(purchasedCard =>
      purchasedCard.invoiceId === card.invoiceId ? { ...purchasedCard, archived: true } : { ...purchasedCard }
    );
    await set<GiftCard[]>('purchasedGiftCards', newCards);
    setPurchasedGiftCards(newCards);
    history.goBack();
  };
  const handleMenuClick = (item: string): void => {
    switch (item) {
      case 'Edit Balance':
        console.log('edit balance');
        break;
      case 'Archive':
        archive();
        break;
      case 'Help':
        return launchNewTab('https://bitpay.com/request-help');
      default:
        console.log('Unknown Menu Option Selected');
    }
    popupState.close();
  };
  return (
    <div className="card-details">
      <div ref={ref}>
        <button className="card-details__more" type="button" {...bindTrigger(popupState)}>
          <img src="../../assets/icons/dots.svg" alt="More" />
        </button>
        <Menu
          {...bindMenu(popupState)}
          getContentAnchorEl={null}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          className="card-details__more__menu"
          style={{ boxShadow: 'none' }}
        >
          {['Edit Balance', 'Archive', 'Help'].map(option => (
            <MenuItem
              className="card-details__more__menu__item"
              key={option}
              onClick={(): void => handleMenuClick(option)}
            >
              {option}
            </MenuItem>
          ))}
        </Menu>
        <CardHeader cardConfig={cardConfig} card={card} />
        <LineItems cardConfig={cardConfig} card={card} />
        {cardConfig.defaultClaimCodeType !== 'link' ? (
          <>
            <CodeBox label="Claim Code" code={card.claimCode} />
            {card.pin ? <CodeBox label="Pin" code={card.pin} /> : null}
          </>
        ) : null}

        {cardConfig.redeemUrl || cardConfig.defaultClaimCodeType === 'link' ? (
          <button
            className="action-button"
            type="button"
            onClick={(): void => launchClaimLink()}
            style={{ marginBottom: '-10px' }}
          >
            Redeem Now
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default Card;
