import React from 'react';
import { Link } from 'react-router-dom';
import { CardConfig, GiftCard } from '../../../services/gift-card.types';
import { groupBy } from '../../../services/utils';
import WalletCard from './wallet-card';

const WalletCards: React.FC<{ activeCards: GiftCard[]; supportedCards: CardConfig[] }> = ({
  activeCards,
  supportedCards
}) => {
  const cardsByBrand = groupBy(activeCards, 'name') as { [brand: string]: GiftCard[] };

  return (
    <div className="wallet-cards">
      <div className="wallet-cards__header">Credits</div>
      {Object.keys(cardsByBrand).map(brand => {
        const cards = cardsByBrand[brand];
        const cardConfig = supportedCards.find(config => config.name === brand) as CardConfig;
        const pathname = cards.length > 1 ? `/cards/${brand}` : `/card/${cards[0].invoiceId}`;
        return (
          <Link
            to={{
              pathname,
              state: {
                cardConfig,
                ...(cards.length > 1 ? { cards } : { card: cards[0] })
              }
            }}
            key={brand}
          >
            <WalletCard type="pocket" cards={cards} cardConfig={cardConfig} />
          </Link>
        );
      })}
    </div>
  );
};

export default WalletCards;
