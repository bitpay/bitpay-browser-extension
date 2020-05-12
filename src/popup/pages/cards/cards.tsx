import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTracking } from 'react-tracking';
import { GiftCard, CardConfig } from '../../../services/gift-card.types';
import { sortByDescendingDate } from '../../../services/gift-card';
import { resizeFrame } from '../../../services/frame';
import WalletCard from '../../components/wallet-cards/wallet-card';
import ActionButton from '../../components/action-button/action-button';
import { Merchant } from '../../../services/merchant';
import { trackComponent } from '../../../services/analytics';
import './cards.scss';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Cards: React.FC<any> = ({ location, purchasedGiftCards, merchants }) => {
  const tracking = useTracking();
  const { cardConfig } = location.state as { cards: GiftCard[]; cardConfig: CardConfig };
  const merchant = merchants.find((m: Merchant) => cardConfig.name === m.name);
  const cards = (purchasedGiftCards as GiftCard[])
    .filter(card => card.name === cardConfig.name && !card.archived && card.status !== 'UNREDEEMED')
    .sort(sortByDescendingDate);
  resizeFrame(405);
  return (
    <>
      <div className="cards-page">
        <WalletCard type="brand-box" cards={cards} cardConfig={cardConfig} />
        {cards.map((card, index) => (
          <motion.div whileHover={{ scale: 0.98 }} whileTap={{ scale: 1.02 }} key={index}>
            <Link
              to={{
                pathname: `/card/${card.invoiceId}`,
                state: {
                  card,
                  cardConfig
                }
              }}
              key={index}
            >
              <WalletCard type="card-box" cards={[card]} cardConfig={cardConfig} />
            </Link>
          </motion.div>
        ))}
      </div>
      {merchant && (
        <div className="action-button__footer--fixed">
          <Link
            to={{ pathname: `/amount/${cardConfig.name}`, state: { cardConfig, merchant } }}
            onClick={(): void => tracking.trackEvent({ action: 'clickedTopUp' })}
          >
            <ActionButton>Top Up</ActionButton>
          </Link>
        </div>
      )}
    </>
  );
};

export default trackComponent(Cards, { page: 'cards' });
