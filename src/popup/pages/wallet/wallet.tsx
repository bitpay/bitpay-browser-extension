import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../../../services/storage';
import { GiftCard } from '../../../services/gift-card.types';
import { groupBy } from '../../../services/utils';

const Wallet: React.FC = () => {
  const [activeGiftCardsByBrand, setActiveGiftCardsByBrand] = useState({} as { [brand: string]: GiftCard[] });
  useEffect(() => {
    const fetchActiveGiftCards = async (): Promise<void> => {
      const purchasedGiftCards = (await get<GiftCard[]>('purchasedGiftCards')) || [];
      const cardsByBrand = groupBy(purchasedGiftCards, 'name') as { [brand: string]: GiftCard[] };
      setActiveGiftCardsByBrand(cardsByBrand);
    };
    fetchActiveGiftCards();
  }, []);
  return (
    <div>
      <div>Wallet</div>
      {Object.keys(activeGiftCardsByBrand).map(brand => {
        const cards = activeGiftCardsByBrand[brand];
        const pathname = cards.length > 1 ? `/cards/${brand}` : `/card/${cards[0].invoiceId}`;
        return (
          <Link
            to={{
              pathname,
              state: {
                ...(cards.length > 1 ? { cards } : { card: cards[0] })
              }
            }}
            key={brand}
          >
            <div>
              {brand} - ${cards.reduce((sum, giftCard) => giftCard.amount + sum, 0)}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default Wallet;
