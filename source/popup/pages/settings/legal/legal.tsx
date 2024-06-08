import React from 'react';
import { useTracking } from 'react-tracking';
import { launchNewTab } from '../../../../services/browser';
import { trackComponent } from '../../../../services/analytics';

const Legal: React.FC = () => {
  const tracking = useTracking();
  const launchTerms = (): void => {
    launchNewTab('https://bitpay.com/about/terms');
    tracking.trackEvent({ action: 'clickedTermsOfUse' });
  };
  const launchPrivacyPolicy = (): void => {
    launchNewTab('https://bitpay.com/about/privacy');
    tracking.trackEvent({ action: 'clickedPrivacyPolicy' });
  };
  return (
    <div className="settings">
      <div className="settings-group">
        <div className="settings-group__label">Legal</div>
        <button type="button" className="settings-group__item" onClick={launchPrivacyPolicy}>
          Privacy Policy
        </button>
        <button type="button" className="settings-group__item" onClick={launchTerms}>
          Terms of Service
        </button>
      </div>
    </div>
  );
};

export default trackComponent(Legal, { page: 'legal' });
