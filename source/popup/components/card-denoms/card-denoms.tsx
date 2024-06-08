import React from 'react';
import { spreadAmounts } from '../../../services/merchant';
import { CardConfig } from '../../../services/gift-card.types';
import { currencySymbols } from '../../../services/currency';

const CardDenoms: React.FC<{ cardConfig: CardConfig }> = ({ cardConfig }) => (
  <>
    {cardConfig.minAmount && cardConfig.maxAmount && (
      <>
        {currencySymbols[cardConfig.currency] ? (
          <>
            {currencySymbols[cardConfig.currency]}
            {cardConfig.minAmount} - {currencySymbols[cardConfig.currency]}
            {cardConfig.maxAmount}
          </>
        ) : (
          <>
            {cardConfig.minAmount} {cardConfig.currency} - {cardConfig.maxAmount} {cardConfig.currency}
          </>
        )}
      </>
    )}
    {cardConfig.supportedAmounts && <>{spreadAmounts(cardConfig.supportedAmounts, cardConfig.currency)}</>}
  </>
);

export default CardDenoms;
