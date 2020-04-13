import React, { useState, useRef, useEffect } from 'react';
import { RouteComponentProps, Link } from 'react-router-dom';
import './brand.scss';
import { browser } from 'webextension-polyfill-ts';

import { formatDiscount, Merchant } from '../../../services/merchant';
import { resizeToFitPage, FrameDimensions } from '../../../services/frame';
import CardDenoms from '../../components/card-denoms/card-denoms';
import ActionButton from '../../components/action-button/action-button';

const Brand: React.FC<RouteComponentProps> = ({ location }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { merchant } = location.state as { merchant: Merchant };
  const [expandText, setExpandText] = useState(false);
  const [pageHeight, setPageHeight] = useState(0);
  const ctaHeight = 125;
  useEffect((): void => {
    if (!ref.current) return;
    resizeToFitPage(ref, merchant.cta || merchant.giftCards[0] ? ctaHeight : 50);
    setPageHeight(ref.current.scrollHeight);
  }, [ref, merchant, expandText]);
  const cardConfig = merchant.giftCards[0];
  if (cardConfig && !cardConfig.description) {
    cardConfig.description = cardConfig.terms;
  }
  function navigatePage(link: string): void {
    let website = link;
    const detectProtocolPresent = /^https?:\/\//i;
    if (!detectProtocolPresent.test(link)) {
      website = `https://${link}`;
    }
    browser.tabs.update({
      url: website
    });
  }
  return (
    <div className="brand-page">
      <div ref={ref}>
        <div className="brand-page__header">
          <div className="brand-page__header__icon--wrapper">
            <img className="brand-page__header__icon" alt={merchant.displayName} src={merchant.icon} />
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
              {merchant.hasDirectIntegration ? <>{merchant.caption}</> : <CardDenoms cardConfig={cardConfig} />}
            </div>
            {merchant.discount && (
              <div
                className="brand-page__header__block__discount"
                style={{ color: merchant.theme, borderColor: merchant.theme }}
              >
                <span style={{ transform: 'translateY(-0.5px)' }}>
                  {formatDiscount(merchant.discount, cardConfig ? cardConfig.currency : merchant.discount.currency)} Off
                  Every Purchase
                </span>
              </div>
            )}
          </div>
        </div>

        <div
          className="brand-page__body"
          style={{ paddingBottom: pageHeight > FrameDimensions.maxFrameHeight - ctaHeight ? '96px' : 'auto' }}
        >
          <div className="brand-page__body__divider" style={{ marginTop: '2px' }} />
          <div className="brand-page__body__content">
            <div className="brand-page__body__content__title">
              {merchant.hasDirectIntegration ? <>Payment Instructions</> : <>About</>}
            </div>
            <div
              className={`brand-page__body__content__text${
                expandText ? ' brand-page__body__content__text--expand' : ''
              }`}
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
          <div className="action-button__footer--fixed">
            {merchant.hasDirectIntegration && merchant.cta ? (
              <ActionButton onClick={(): void => merchant.cta && navigatePage(merchant.cta.link)}>
                {merchant.cta.displayText}
              </ActionButton>
            ) : (
              <Link to={{ pathname: `/amount/${cardConfig.name}`, state: { cardConfig } }}>
                <ActionButton>Buy Credits</ActionButton>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Brand;
