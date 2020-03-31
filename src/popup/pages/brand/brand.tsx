import React, { useState } from 'react';
import './brand.scss';

import { Link } from 'react-router-dom';
import { currencySymbols, spreadAmounts } from '../../../services/merchant';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Brand: React.FC<any> = ({ match: { params }, location }) => {
  const { merchant } = location.state;
  const cardConfig = merchant.giftCards[0];
  if (!cardConfig.description) {
    cardConfig.description = cardConfig.terms;
    cardConfig.terms = null;
  }
  const [expandText, setExpandText] = useState(false);
  function showText(): void {
    setExpandText(true);
  }
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

      <div className="brand-page__body" style={{ paddingBottom: '100px' }}>
        <div className="brand-page__body__divider" style={{ marginTop: '2px' }} />
        <div className="brand-page__body__content">
          <div className="brand-page__body__content__title">
            {merchant.hasDirectIntegration ? <>Payment Instructions</> : <>About</>}
          </div>
          <div
            className={`brand-page__body__content__text${expandText ? ' brand-page__body__content__text--expand' : ''}`}
          >
            {merchant.hasDirectIntegration ? <>{merchant.instructions}</> : <>{cardConfig.description}</>}
            {!expandText && (
              <button type="button" onClick={showText} className="brand-page__body__content__text--action">
                more
              </button>
            )}
          </div>
        </div>
        {expandText && cardConfig.terms && (
          <>
            <div className="brand-page__body__divider" />
            <div className="brand-page__body__content">
              <div className="brand-page__body__content__title">Terms & Conditions</div>
              <div className="brand-page__body__content__text brand-page__body__content__text--expand">
                {cardConfig.terms}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="action-button__footer">
        <Link className="action-button" to={{ pathname: `/amount/${params.brand}`, state: { merchant } }}>
          Buy Credits
        </Link>
      </div>
    </div>
  );
};

export default Brand;
