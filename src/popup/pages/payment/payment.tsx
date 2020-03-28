import React, { useState } from 'react';
import { browser } from 'webextension-polyfill-ts';
import { createBitPayInvoice } from '../../../services/gift-card';
import { get } from '../../../services/storage';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Payment: React.FC<any> = ({ match: { params }, location }) => {
  const [awaitingPayment, setAwaitingPayment] = useState(false);
  const amount = location.state.amount as number;
  const currency = location.state.currency as string;
  const launchInvoice = async (): Promise<void> => {
    const clientId = await get<string>('clientId');
    const { invoiceId } = await createBitPayInvoice({
      brand: params.brand,
      currency,
      amount,
      clientId,
      discounts: [],
      email: 'satoshi@nakamoto.com'
    });
    setAwaitingPayment(true);
    browser.runtime.sendMessage({
      name: 'LAUNCH_PAGE',
      url: `${process.env.API_ORIGIN}/invoice?id=${invoiceId}&v=3?view=page`
    });
  };
  return (
    <div>
      <div>{params.brand}</div>
      <div>
        Pay me ${amount} {currency}:
      </div>
      {!awaitingPayment ? (
        <button type="button" onClick={launchInvoice}>
          Pay with BitPay
        </button>
      ) : (
        <div>Awaiting payment...</div>
      )}
    </div>
  );
};

export default Payment;
