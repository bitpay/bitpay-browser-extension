import React from 'react';
import './brand.scss';

import { Link } from 'react-router-dom';
import { currencySymbols, spreadAmounts } from '../../../services/merchant';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Brand: React.FC<any> = ({ match: { params }, location }) => {
  const { merchant } = location.state;
  const cardConfig = merchant.giftCards[0];
  return (
    <div className="brand-page">
      <div className="brand-page__header">
        <img className="brand-page__header__icon" alt={params.brand} src={merchant.icon} />
        <div className="brand-page__header__block">
          <div className="brand-page__header__block__title">{merchant.displayName}</div>
          <div className="brand-page__header__block__caption">
            {merchant.hasDirectIntegration ? (
              <>{merchant.caption}</>
            ) : (
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

      <div className="brand-page__body" style={{ marginBottom: '80px' }}>
        <div className="brand-page__body__divider" style={{ margin: '2px 8px 18px' }} />
        <div className="brand-page__body__content">
          <div className="brand-page__body__content__title">
            {merchant.hasDirectIntegration ? <>Payment Instructions</> : <>About</>}
          </div>
          <div className="brand-page__body__content__text">
            {merchant.hasDirectIntegration ? <>{merchant.instructions}</> : <>{cardConfig.terms}</>}
          </div>
        </div>
      </div>

      <div className="action-button__footer">
        <Link className="action-button" to={`/amount/${params.brand}`}>
          Buy Credits
        </Link>
      </div>
    </div>
  );
};

export default Brand;
