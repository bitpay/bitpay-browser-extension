import React, { useRef, useEffect } from 'react';

import { GiftCard, CardConfig } from '../../../services/gift-card.types';
import { Merchant } from '../../../services/merchant';
import MerchantCta from '../../components/merchant-cta/merchant-cta';
import WalletCards from '../../components/wallet-cards/wallet-cards';
import './wallet.scss';
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
    <div className="wallet" ref={ref}>
      <MerchantCta merchant={supportedMerchant} />
      <div className="wallet-codes">
        {activeGiftCards.length && supportedGiftCards.length ? (
          <WalletCards activeCards={activeGiftCards} supportedCards={supportedGiftCards} />
        ) : (
          <div className="wallet-codes__zero-state">
            <div>
              <div className="wallet-codes__zero-state__title">No Codes Yet</div>
              <div className="wallet-codes__zero-state__subtitle">Your purchased credits will show up here.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
