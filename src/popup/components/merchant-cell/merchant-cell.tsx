import React from 'react';
import './merchant-cell.scss';
import { Merchant } from '../../../services/merchant';

const currencySymbols: Record<string, string> = {
  USD: '$',
  GBP: '£',
  EUR: '€',
  JPY: '¥',
  INR: '₹',
  CAD: 'C$',
  PHP: '₱',
  BRL: 'R$'
};

function spreadAmounts(values: Array<number>, currencySymbol: string | undefined, currency: string): string {
  let caption = '';
  values.forEach((value: number, index: number) => {
    caption = currencySymbol
      ? caption + currencySymbol + value.toString()
      : `${caption + value.toString()} ${currency}`;
    if (values.length - index >= 2) {
      caption += ', ';
    }
  });
  return caption;
}

const MerchantCell: React.FC<{ merchant: Merchant }> = ({ merchant }) => {
  const cardConfig = merchant.giftCards[0];
  return (
    <div className="MerchantCell">
      <img className="MerchantCell__Avatar" alt="amazon" src={merchant.logo} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="MerchantCell__Title">{merchant.displayName}</div>
        <div className="MerchantCell__Caption">
          {merchant.hasDirectIntegration ? (
            <>{merchant.caption}</>
          ) : (
            <>
              {cardConfig.minAmount && cardConfig.maxAmount && (
                <>
                  ${merchant.giftCards[0].minAmount} - ${merchant.giftCards[0].maxAmount}
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
