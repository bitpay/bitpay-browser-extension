import React, { useEffect } from 'react';
import './merchant-cta.scss';
import { Link } from 'react-router-dom';
import { useTracking } from 'react-tracking';
import { Merchant, getDiscount, getPromoEventParams } from '../../../services/merchant';
import CardDenoms from '../card-denoms/card-denoms';
import SuperToast from '../super-toast/super-toast';
import DiscountText from '../discount-text/discount-text';
import { getVisibleCoupon } from '../../../services/gift-card';

const MerchantCta: React.FC<{ merchant?: Merchant; slimCTA: boolean }> = ({ merchant, slimCTA }) => {
  const tracking = useTracking();
  const ctaPath = merchant && (merchant.hasDirectIntegration ? `/brand/${merchant.name}` : `/amount/${merchant.name}`);
  const hasDiscount = !!(merchant && getDiscount(merchant));
  const hasGiftCardDiscount = !!(merchant && getVisibleCoupon(merchant.giftCards[0]));
  useEffect(() => {
    if (!merchant || !hasGiftCardDiscount) return;
    tracking.trackEvent({
      action: 'presentedWithGiftCardPromo',
      ...getPromoEventParams(merchant),
      gaAction: `presentedWithGiftCardPromo:${merchant.name}`
    });
  }, [tracking, hasGiftCardDiscount, merchant]);
  return (
    <>
      {merchant ? (
        <div className="merchant-cta">
          <div className="merchant-cta__content">
            <img src={merchant.icon} alt={`${merchant.displayName} icon`} />
            <div className="merchant-cta__content__text ellipsis">
              <div className="merchant-cta__content__merchant ellipsis">{merchant.displayName}</div>
              {hasDiscount ? (
                <div className="merchant-cta__content__promo ellipsis">
                  <DiscountText merchant={merchant} />
                </div>
              ) : (
                <>
                  {merchant.hasDirectIntegration ? (
                    <div className="merchant-cta__content__caption ellipsis">{merchant.caption}</div>
                  ) : (
                    <div className="merchant-cta__content__caption ellipsis">
                      <CardDenoms cardConfig={merchant.giftCards[0]} />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <Link
            to={{ pathname: ctaPath, state: { merchant, cardConfig: merchant.giftCards[0] } }}
            onClick={(): void =>
              tracking.trackEvent({
                action: 'clickedMerchantWalletCta',
                merchant: merchant.name,
                gaAction: `clickedMerchantWalletCta:${merchant.name}`
              })
            }
          >
            {merchant.hasDirectIntegration ? <>Learn More</> : <>Buy Now</>}
          </Link>
        </div>
      ) : (
        <>
          {slimCTA ? (
            <>
              <Link
                to={{ pathname: '/shop' }}
                onClick={(): void => tracking.trackEvent({ action: 'clickedGeneralWalletCta' })}
              >
                <SuperToast
                  title="Spend Crypto Instantly"
                  caption="Purchase store credit at more than a 100+ major retailers"
                  shopMode
                />
              </Link>
            </>
          ) : (
            <div className="merchant-cta">
              <img className="merchant-cta__zero__hero" src="./../assets/brands.png" alt="brands" />
              <div className="merchant-cta__zero__title">Spend Crypto Instantly</div>
              <div className="merchant-cta__zero__description">
                Purchase store credit with BTC, BCH, ETH and more at 100+ major retailers.
              </div>
              <Link className="zero" to={{ pathname: '/shop' }}>
                View All Brands
              </Link>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default MerchantCta;
