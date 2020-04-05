import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { resizeFrame } from '../../../../services/frame';
import { GiftCard, CardConfig } from '../../../../services/gift-card.types';
import { formatCurrency } from '../../../../services/currency';
import { sortByDescendingDate } from '../../../../services/gift-card';
import './archive.scss';

const Archive: React.FC<{ purchasedGiftCards: GiftCard[]; supportedGiftCards: CardConfig[] }> = ({
  purchasedGiftCards,
  supportedGiftCards
}) => {
  resizeFrame(450);
  const archivedGiftCards = purchasedGiftCards.filter(card => card.archived).sort(sortByDescendingDate);
  return (
    <div className="settings archive">
      {archivedGiftCards.length ? (
        <div className="settings-group">
          <div className="settings-group__label">Archive</div>
          {archivedGiftCards.map((card, index) => {
            const cardConfig = supportedGiftCards.find(config => config.name === card.name);
            return (
              <Link
                type="button"
                className="settings-group__item"
                key={index}
                to={{ pathname: `/card/${card.invoiceId}`, state: { card, cardConfig } }}
              >
                <img
                  className="settings-group__item__avatar"
                  src={cardConfig?.icon}
                  alt={`${cardConfig?.displayName} logo`}
                />
                <div className="settings-group__item__label">
                  <div>{cardConfig?.displayName}</div>
                  <div className="settings-group__item__note">
                    {formatCurrency(card.amount, card.currency, { hideSymbol: true })}
                  </div>
                </div>
                <div className="settings-group__item__value">{format(new Date(card.date), 'MMM dd yyyy')}</div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="zero-state">
          <div className="zero-state__title">No Archived Gift Cards</div>
          <div className="zero-state__subtitle">You haven't archived any gift cards yet.</div>
        </div>
      )}
    </div>
  );
};

export default Archive;
