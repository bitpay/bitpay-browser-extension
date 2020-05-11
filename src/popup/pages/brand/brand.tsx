import React, { useState, useRef, useEffect } from 'react';
import { RouteComponentProps, Link } from 'react-router-dom';
import { useTracking } from 'react-tracking';
import ReactMarkdown from 'react-markdown';
import { Merchant, getDiscount } from '../../../services/merchant';
import { resizeToFitPage, FrameDimensions } from '../../../services/frame';
import { goToPage } from '../../../services/browser';
import CardDenoms from '../../components/card-denoms/card-denoms';
import ActionButton from '../../components/action-button/action-button';
import DiscountText from '../../components/discount-text/discount-text';
import { trackComponent } from '../../../services/analytics';
import './brand.scss';

const Brand: React.FC<RouteComponentProps> = ({ location }) => {
  const tracking = useTracking();
  const ref = useRef<HTMLDivElement>(null);
  const { merchant } = location.state as { merchant: Merchant };
  const initiallyExpanded = merchant.hasDirectIntegration && merchant.instructions.length < 300;
  const [textExpanded, setTextExpanded] = useState(initiallyExpanded);
  const [pageHeight, setPageHeight] = useState(0);
  const ctaHeight = 125;
  const getEventParams = (action: string): { action: string; gaAction: string; merchant: string } => ({
    action,
    gaAction: `${action}:${merchant.name}`,
    merchant: merchant.name
  });
  const expandText = (): void => {
    setTextExpanded(true);
    tracking.trackEvent(getEventParams('expandedText'));
  };
  const launchMerchantWebsite = (): void => {
    goToPage(merchant.link);
    tracking.trackEvent(getEventParams('launchedMerchantWebsite'));
  };
  const handleMerchantCtaClick = (): void => {
    if (!merchant.cta) return;
    goToPage(merchant.cta.link);
    tracking.trackEvent(getEventParams('clickedMerchantCta'));
  };
  useEffect((): void => {
    if (!ref.current) return;
    resizeToFitPage(ref, merchant.cta || merchant.giftCards[0] ? ctaHeight : 50);
    setPageHeight(ref.current.scrollHeight);
  }, [ref, merchant, textExpanded]);
  const cardConfig = merchant.giftCards[0];
  if (cardConfig && !cardConfig.description) {
    cardConfig.description = cardConfig.terms;
  }
  const color = merchant.theme === '#ffffff' ? '#4f6ef7' : merchant.theme;
  const bubbleStyle = { color: { color, borderColor: color }, contents: { transform: 'translateY(-0.5px)' } };
  const bodyStyle = {
    scroll: { paddingBottom: pageHeight > FrameDimensions.maxFrameHeight - ctaHeight ? '96px' : 'auto' },
    divider: { marginTop: '2px' }
  };
  return (
    <div className="brand-page">
      <div ref={ref}>
        <div className="brand-page__header">
          <div className="brand-page__header__icon--wrapper">
            <img className="brand-page__header__icon" alt={merchant.displayName} src={merchant.icon} />
            <button className="brand-page__header__icon--hover" onClick={launchMerchantWebsite} type="button">
              <img alt="go to website" src="../assets/icons/link-icon.svg" />
            </button>
          </div>
          <div className="brand-page__header__block">
            <div className="brand-page__header__block__title">{merchant.displayName}</div>
            <div className="brand-page__header__block__caption">
              {merchant.hasDirectIntegration ? <>{merchant.caption}</> : <CardDenoms cardConfig={cardConfig} />}
            </div>
            {getDiscount(merchant) && (
              <div className="brand-page__header__block__discount" style={bubbleStyle.color}>
                <div style={bubbleStyle.contents}>
                  <DiscountText merchant={merchant} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="brand-page__body" style={bodyStyle.scroll}>
          <div className="brand-page__body__divider" style={bodyStyle.divider} />
          <div className="brand-page__body__content">
            <div className="brand-page__body__content__title">
              {merchant.hasDirectIntegration ? <>Payment Instructions</> : <>About</>}
            </div>
            <div
              className={`brand-page__body__content__text${
                textExpanded ? ' brand-page__body__content__text--expand' : ''
              }`}
            >
              {merchant.hasDirectIntegration ? (
                <>{merchant.instructions}</>
              ) : (
                <>
                  <ReactMarkdown source={cardConfig.description} linkTarget="_blank" />
                </>
              )}
              {!textExpanded && (
                <button type="button" onClick={expandText} className="brand-page__body__content__text--action">
                  more
                </button>
              )}
            </div>
          </div>
          {textExpanded && cardConfig && cardConfig.terms && (
            <>
              <div className="brand-page__body__divider" />
              <div className="brand-page__body__content">
                <div className="brand-page__body__content__title">Terms & Conditions</div>
                <div className="brand-page__body__content__text brand-page__body__content__text--expand">
                  <ReactMarkdown source={cardConfig.terms} linkTarget="_blank" />
                </div>
              </div>
            </>
          )}
        </div>

        {(merchant.cta || cardConfig) && (
          <div className="action-button__footer--fixed">
            {merchant.hasDirectIntegration && merchant.cta ? (
              <ActionButton onClick={handleMerchantCtaClick}>{merchant.cta.displayText}</ActionButton>
            ) : (
              <Link to={{ pathname: `/amount/${cardConfig.name}`, state: { cardConfig, merchant } }}>
                <ActionButton>Buy Credits</ActionButton>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default trackComponent(Brand, { page: 'brand' });
