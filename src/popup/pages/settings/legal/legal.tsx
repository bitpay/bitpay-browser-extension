import React from 'react';
import { launchNewTab } from '../../../../services/browser';

const Legal: React.FC = () => (
  <div className="settings">
    <div className="settings-group">
      <div className="settings-group__label">Legal</div>
      <button
        type="button"
        className="settings-group__item"
        onClick={(): void => launchNewTab('https://bitpay.com/about/privacy')}
      >
        Privacy Policy
      </button>
      <button
        type="button"
        className="settings-group__item"
        onClick={(): void => launchNewTab('https://bitpay.com/about/terms')}
      >
        Terms of Service
      </button>
    </div>
  </div>
);

export default Legal;
