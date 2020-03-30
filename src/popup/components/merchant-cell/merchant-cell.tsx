import React from 'react';
import './merchant-cell.scss';
import { Merchant, currencySymbols, spreadAmounts } from '../../../services/merchant';

const MerchantCell: React.FC<{ merchant: Merchant }> = ({ merchant }) => {
  const cardConfig = merchant.giftCards[0];
  return (
    <div className="MerchantCell">
      <img className="MerchantCell__Avatar" alt="amazon" src={merchant.icon} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="MerchantCell__Title">{merchant.displayName}</div>
        <div className="MerchantCell__Caption">
          {merchant.hasDirectIntegration ? (
            <>{merchant.caption}</>
          ) : (
            <>
              {cardConfig.minAmount && cardConfig.maxAmount && (
                <>
                  {currencySymbols[cardConfig.currency] ? (
                    <>
                      {currencySymbols[cardConfig.currency]}
                      {merchant.giftCards[0].minAmount} - {currencySymbols[cardConfig.currency]}
                      {merchant.giftCards[0].maxAmount}
                    </>
                  ) : (
                    <>
                      {merchant.giftCards[0].minAmount} {cardConfig.currency} - {merchant.giftCards[0].maxAmount}{' '}
                      {cardConfig.currency}
                    </>
                  )}
                </>
              )}
              {cardConfig.supportedAmounts && (
                <>
                  {spreadAmounts(
                    cardConfig.supportedAmounts,
                    currencySymbols[cardConfig.currency],
                    cardConfig.currency
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MerchantCell;
