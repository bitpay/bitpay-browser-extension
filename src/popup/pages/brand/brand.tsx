import React, { useState } from 'react';
import './brand.scss';
import { browser } from 'webextension-polyfill-ts';
import { Link } from 'react-router-dom';
import { currencySymbols, spreadAmounts } from '../../../services/merchant';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Brand: React.FC<any> = ({ match: { params }, location }) => {
  const { merchant } = location.state;
  const cardConfig = merchant.giftCards[0];
  if (cardConfig && !cardConfig.description) {
    cardConfig.description = cardConfig.terms;
    cardConfig.terms = null;
  }
  const [expandText, setExpandText] = useState(false);
  function navigatePage(link: string): void {
    let website = link;
    const detectProtocolPresent = /^https?:\/\//i;
    if (!detectProtocolPresent.test(link)) {
      website = `http://${link}`;
    }
    browser.tabs.update({
      url: website
    });
  }
  return (
    <div className="brand-page">
      <div className="brand-page__header">
        <div className="brand-page__header__icon--wrapper">
          <img className="brand-page__header__icon" alt={params.brand} src={merchant.icon} />
          <button
            className="brand-page__header__icon--hover"
            onClick={(): void => navigatePage(merchant.link)}
            type="button"
          >
            <img alt="go to website" src="../assets/icons/link-icon.svg" />
          </button>
        </div>
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
              <button
                type="button"
                onClick={(): void => setExpandText(true)}
                className="brand-page__body__content__text--action"
              >
                more
              </button>
            )}
          </div>
        </div>
        {expandText && cardConfig && cardConfig.terms && (
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

      {(merchant.cta || cardConfig) && (
        <div className="action-button__footer">
          {merchant.hasDirectIntegration ? (
            <button className="action-button" onClick={(): void => navigatePage(merchant.cta.link)} type="button">
              {merchant.cta.displayText}
            </button>
          ) : (
            <Link className="action-button" to={{ pathname: `/amount/${params.brand}`, state: { merchant } }}>
              Buy Credits
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Brand;
