import React, { useEffect, useState } from 'react';
import { get } from '../../../services/storage';
import { GiftCard, CardConfig } from '../../../services/gift-card.types';
import { Merchant } from '../../../services/merchant';
import MerchantCta from '../../components/merchant-cta/merchant-cta';
import WalletCards from '../../components/wallet-cards/wallet-cards';
import './wallet.scss';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Wallet: React.FC<{ supportedMerchant?: Merchant }> = ({ supportedMerchant }) => {
  const [activeGiftCards, setActiveGiftCards] = useState([] as GiftCard[]);
  const [supportedGiftCards, setSupportedGiftCards] = useState([] as CardConfig[]);

  useEffect(() => {
    const fetchActiveGiftCards = async (): Promise<void> => {
      const [purchasedCards, supportedCards] = await Promise.all<GiftCard[], CardConfig[]>([
        get<GiftCard[]>('purchasedGiftCards'),
        get<CardConfig[]>('availableGiftCards')
      ]);
      setActiveGiftCards((purchasedCards || []).filter(card => !card.archived));
      setSupportedGiftCards(supportedCards);
    };
    fetchActiveGiftCards();
  }, []);
  return (
    <div className="wallet">
      {supportedMerchant ? (
        <>
          <MerchantCta merchant={supportedMerchant} />
        </>
      ) : null}
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
