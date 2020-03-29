import React from 'react';
import './merchant-cell.scss';

export interface MerchantCell {
  avatar: string;
  displayName: string;
  minAmount: number | undefined;
  maxAmount: number | undefined;
  amounts: Array<number> | undefined;
  currency: string;
}

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

const MerchantCell: React.FC<MerchantCell> = merchant => (
  <div className="MerchantCell">
    <img className="MerchantCell__Avatar" alt="amazon" src={merchant.avatar} />
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="MerchantCell__Title">{merchant.displayName}</div>
      {merchant.minAmount && merchant.maxAmount && (
        <div className="MerchantCell__Caption">
          ${merchant.minAmount} - ${merchant.maxAmount}
        </div>
      )}
      {merchant.amounts && (
        <div className="MerchantCell__Caption">
          {spreadAmounts(merchant.amounts, currencySymbols[merchant.currency], merchant.currency)}
        </div>
      )}
    </div>
  </div>
);

export default MerchantCell;
