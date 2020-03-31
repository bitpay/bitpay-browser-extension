import React from 'react';
import { Link } from 'react-router-dom';
import { Merchant } from '../../../services/merchant';

const MerchantCta: React.FC<{ merchant: Merchant }> = ({ merchant }) => {
  const ctaPath = merchant.hasDirectIntegration ? `/brand/${merchant.name}` : `/amount/${merchant.name}`;
  return (
    <>
      <div className="merchant-cta">
        <div className="merchant-cta__content">
          <img src={merchant.icon} alt={`${merchant.displayName} icon`} />
          <div className="merchant-cta__content__text">
            <div className="merchant-cta__content__merchant ellipsis">{merchant.displayName}</div>
            {merchant.hasDirectIntegration ? (
              <div className="merchant-cta__content__caption ellipsis">{merchant.caption}</div>
            ) : (
              <div className="merchant-cta__content__promo ellipsis">3% Off Each Purchase</div>
            )}
          </div>
        </div>
        <Link to={{ pathname: ctaPath, state: { merchant } }}>
          {merchant.hasDirectIntegration ? <>Learn More</> : <>Buy Now</>}
        </Link>
      </div>
    </>
  );
};

export default MerchantCta;
