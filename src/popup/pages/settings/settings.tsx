import React from 'react';
import './settings.scss';
import { Link } from 'react-router-dom';
import { resizeFrame } from '../../../services/frame';

const Settings: React.FC<{ email: string }> = ({ email }) => {
  resizeFrame(450);
  return (
    <div className="settings">
      <div className="settings-group">
        <div className="settings-group__label">Wallet</div>
        <div className="settings-group__item">Hide Empty Balances</div>
        <button type="button" className="settings-group__item">
          Archived Gift Cards
        </button>
      </div>
      <div className="settings-group">
        <div className="settings-group__label">Email</div>
        <Link className="settings-group__item settings-group__item--dark" to="/settings/email">
          {email || 'None'}
        </Link>
        <div className="settings-group__caption">Email used for purchase receipts and communication</div>
      </div>
      <div className="settings-group">
        <div className="settings-group__label">Other</div>
        <button type="button" className="settings-group__item">
          <div className="settings-group__item__label">Country</div>
          <div className="settings-group__item__value">USA</div>
        </button>
        <button type="button" className="settings-group__item">
          Legal
        </button>
        <div className="settings-group__item">
          <div className="settings-group__item__label">Version</div>
          <div className="settings-group__item__value">1.0.0</div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
