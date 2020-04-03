import React, { useRef, useEffect } from 'react';
import './wallet.scss';
import { GiftCard, CardConfig } from '../../../services/gift-card.types';
import { Merchant } from '../../../services/merchant';
import MerchantCta from '../../components/merchant-cta/merchant-cta';
import WalletCards from '../../components/wallet-cards/wallet-cards';
import { sortByDescendingDate } from '../../../services/gift-card';
import { resizeToFitPage } from '../../../services/frame';

const Wallet: React.FC<{
  supportedMerchant?: Merchant;
  supportedGiftCards: CardConfig[];
  purchasedGiftCards: GiftCard[];
}> = ({ supportedMerchant, supportedGiftCards, purchasedGiftCards }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    resizeToFitPage(ref, 70);
  }, [ref]);
  const activeGiftCards = purchasedGiftCards.filter(card => !card.archived).sort(sortByDescendingDate);
  return (
    <div className="wallet">
      <MerchantCta merchant={supportedMerchant} slimCTA />
      <div className="wallet-codes">
        {activeGiftCards.length && supportedGiftCards.length ? (
          <WalletCards activeCards={activeGiftCards} supportedCards={supportedGiftCards} />
        ) : (
          <div className="zero-state" style={{ height: '100%' }}>
            <div className="zero-state__title">No Codes Yet</div>
            <div className="zero-state__subtitle">Your purchased credits will show up here</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
