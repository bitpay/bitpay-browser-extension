import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { useTracking } from 'react-tracking';
import { trackComponent } from '../../../services/analytics';
import { resizeFrame } from '../../../services/frame';
import { BitpayUser } from '../../../services/bitpay-id';
import { launchNewTab } from '../../../services/browser';
import Gravatar from '../../components/gravatar/gravatar';
import packageJson from '../../../../package.json';
import './settings.scss';

const Settings: React.FC<{ email: string; user: BitpayUser }> = ({ email, user }) => {
  const tracking = useTracking();
  resizeFrame(450);
  const launchRepo = (): void => {
    launchNewTab('https://github.com/bitpay/bitpay-browser-extension');
    tracking.trackEvent({ action: 'clickedVersion' });
  };
  return (
    <div className="settings">
      <div className="settings-group">
        <div className="settings-group__label">Wallet</div>
        <Link type="button" className="settings-group__item" to="/settings/archive">
          Archived Gift Cards
        </Link>
      </div>
      <div className="settings-group">
        <div className="settings-group__label">BitPay Account</div>
        <Link
          type="button"
          className={classNames({
            'settings-group__item': true,
            'settings-group__item--dark': user,
            'settings-group__item--link': !user
          })}
          to="/settings/account"
        >
          {user ? (
            <Gravatar email={user.email} size="16" />
          ) : (
            <img alt="BitPay Logo" src="assets/icons/favicon-128.png" />
          )}
          {user ? <>{user.email}</> : <>Connect to BitPay</>}
        </Link>
        <div className="settings-group__caption">
          {user ? (
            <>Your BitPay account is linked to this app</>
          ) : (
            <>Sign in with BitPay to sync your gift card purchases</>
          )}
        </div>
      </div>
      {email && !user && (
        <div className="settings-group">
          <div className="settings-group__label">Email</div>
          <Link className="settings-group__item settings-group__item--dark" to="/settings/email">
            {email || 'None'}
          </Link>
          <div className="settings-group__caption">Email used for purchase receipts and communication</div>
        </div>
      )}
      <div className="settings-group">
        <div className="settings-group__label">Other</div>
        <Link type="button" className="settings-group__item" to="/settings/legal">
          Legal
        </Link>
        <button type="button" className="settings-group__item" onClick={launchRepo}>
          <div className="settings-group__item__label">Version</div>
          <div className="settings-group__item__value">{packageJson.version}</div>
        </button>
      </div>
    </div>
  );
};

export default trackComponent(Settings, { page: 'settings' });
