import React, { useState, useRef, useEffect } from 'react';
import { RouteComponentProps, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Merchant, getDiscount } from '../../../services/merchant';
import { resizeToFitPage, FrameDimensions } from '../../../services/frame';
import { goToPage } from '../../../services/browser';
import CardDenoms from '../../components/card-denoms/card-denoms';
import ActionButton from '../../components/action-button/action-button';
import DiscountText from '../../components/discount-text/discount-text';
import './brand.scss';

const Brand: React.FC<RouteComponentProps> = ({ location }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { merchant } = location.state as { merchant: Merchant };
  const initiallyExpanded = merchant.hasDirectIntegration && merchant.instructions.length < 300;
  const [expandText, setExpandText] = useState(initiallyExpanded);
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
            <button
              className="brand-page__header__icon--hover"
              onClick={(): void => goToPage(merchant.link)}
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
                expandText ? ' brand-page__body__content__text--expand' : ''
              }`}
            >
              {merchant.hasDirectIntegration ? (
                <>{merchant.instructions}</>
              ) : (
                <>
                  <ReactMarkdown source={cardConfig.description} linkTarget="_blank" />
                </>
              )}
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
                  <ReactMarkdown source={cardConfig.terms} linkTarget="_blank" />
                </div>
              </div>
            </>
          )}
        </div>

        {(merchant.cta || cardConfig) && (
          <div className="action-button__footer--fixed">
            {merchant.hasDirectIntegration && merchant.cta ? (
              <ActionButton onClick={(): void => merchant.cta && goToPage(merchant.cta.link)}>
                {merchant.cta.displayText}
              </ActionButton>
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

export default Brand;
