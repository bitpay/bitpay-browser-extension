import './brand.scss';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { useTracking } from 'react-tracking';
import Observer from '@researchgate/react-intersection-observer';
import ReactMarkdown from 'react-markdown';
import { Directory, DirectoryCategory } from '../../../services/directory';
import { Merchant, getDiscount } from '../../../services/merchant';
import { resizeToFitPage, FrameDimensions } from '../../../services/frame';
import { goToPage } from '../../../services/browser';
import CardDenoms from '../../components/card-denoms/card-denoms';
import ActionButton from '../../components/action-button/action-button';
import DiscountText from '../../components/discount-text/discount-text';
import MerchantCell from '../../components/merchant-cell/merchant-cell';
import { trackComponent } from '../../../services/analytics';

const Brand: React.FC<RouteComponentProps & { directory: Directory }> = ({ location, directory }) => {
  const tracking = useTracking();
  const ref = useRef<HTMLDivElement>(null);
  const { merchant } = location.state as { merchant: Merchant };
  const cardConfig = merchant.giftCards[0];
  if (cardConfig && !cardConfig.description) cardConfig.description = cardConfig.terms;
  const initiallyExpanded = (): boolean => {
    if (merchant.hasDirectIntegration) return merchant.instructions.length < 300;
    if (cardConfig?.description && !cardConfig.terms) return cardConfig.description.length < 300;
    return false;
  };
  const [pageEntering, setPageEntering] = useState(true);
  const [textExpanded, setTextExpanded] = useState(initiallyExpanded());
  const [padding, setPadding] = useState({});
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
  const color = merchant.theme === '#ffffff' ? '#4f6ef7' : merchant.theme;
  const bubbleColor = { color, borderColor: color };
  const suggested = useMemo((): { category: DirectoryCategory; suggestions: Merchant[] } => {
    const category = [...directory.categories].sort(
      (a, b) =>
        b.tags.filter((tag: string) => merchant.tags.includes(tag)).length -
        a.tags.filter((tag: string) => merchant.tags.includes(tag)).length
    )[0];
    const suggestions = category.availableMerchants
      .filter((m: Merchant) => m.displayName !== merchant.displayName)
      .sort(
        (a: Merchant, b: Merchant) =>
          b.tags.filter((tag: string) => merchant.tags.includes(tag)).length -
          a.tags.filter((tag: string) => merchant.tags.includes(tag)).length
      )
      .slice(0, 8)
      .sort(() => 0.5 - Math.random());
    return { category, suggestions };
  }, [directory, merchant]);
  useEffect((): void => {
    if (!ref.current) return;
    const resizePadding = (): number => {
      if (merchant.cta || merchant.giftCards[0])
        if (suggested.suggestions.length > 1) return -150;
        else return 125;
      return 50;
    };
    const bodyPadding = (scrollHeight: number): string => {
      if (merchant.cta || merchant.giftCards[0])
        if (scrollHeight > FrameDimensions.maxFrameHeight - 125) return '96px';
        else if (suggested.suggestions.length > 1) return '96px';
      return 'auto';
    };
    resizeToFitPage(ref, resizePadding());
    setPadding({ paddingBottom: bodyPadding(ref.current.scrollHeight) });
  }, [ref, merchant, textExpanded, suggested]);
  useEffect(() => {
    setTimeout(() => {
      setPageEntering(false);
    }, 400);
  }, []);
  const handleIntersection = (event: IntersectionObserverEntry): void => {
    if (event.isIntersecting)
      tracking.trackEvent({
        action: 'scrolledToSuggestedMerchants',
        merchant: merchant.name,
        gaAction: `scrolledToSuggestedMerchants:${merchant.name}`
      });
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
              <div className="brand-page__header__block__discount" style={bubbleColor}>
                <DiscountText merchant={merchant} />
              </div>
            )}
          </div>
        </div>

        <div className="brand-page__body" style={padding}>
          <div className="brand-page__body__divider" style={{ marginTop: '2px' }} />
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
          {textExpanded && cardConfig?.terms && cardConfig.terms !== cardConfig.description && (
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
          {suggested?.suggestions?.length > 1 && (
            <>
              <div className="brand-page__body__divider" />
              <div className="shop-page__section-header">
                You Might Also Like
                {suggested.category && (
                  <Link
                    className="shop-page__section-header--action"
                    to={{
                      pathname: `/category/${suggested.category.displayName}`,
                      state: { category: suggested.category }
                    }}
                    onClick={(): void => {
                      tracking.trackEvent({
                        action: 'viewedAllSuggestedMerchants',
                        merchant: merchant.name,
                        gaAction: `viewedAllSuggestedMerchants:${merchant.name}`
                      });
                    }}
                  >
                    See All
                  </Link>
                )}
              </div>

              <Observer onChange={handleIntersection} threshold={0.8} disabled={pageEntering}>
                <div>
                  {suggested.suggestions.slice(0, 2).map(suggestion => (
                    <Link
                      to={{
                        pathname: `/brand/${suggestion.name}`,
                        state: { merchant: suggestion }
                      }}
                      key={suggestion.name}
                      onClick={(): void => {
                        tracking.trackEvent({
                          action: 'clickedSuggestedMerchant',
                          merchant: merchant.name,
                          suggestedMerchant: suggestion.name,
                          gaAction: `clickedSuggestedMerchant:${merchant.name}:${suggestion.name}`
                        });
                      }}
                    >
                      <MerchantCell key={suggestion.name} merchant={suggestion} />
                    </Link>
                  ))}
                </div>
              </Observer>
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
