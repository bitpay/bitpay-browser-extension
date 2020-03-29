import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { browser } from 'webextension-polyfill-ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Navbar: React.FC<any> = ({ history, location }) => {
  const [collapsed, setCollapsed] = useState(false);
  const goBack = (): void => {
    history.goBack();
  };
  const collapse = (): void => {
    setCollapsed(true);
    browser.runtime.sendMessage({ name: 'POPUP_COLLAPSED' });
  };
  const expand = (): void => {
    setCollapsed(false);
    browser.runtime.sendMessage({ name: 'POPUP_EXPANDED' });
  };
  const close = (): void => {
    browser.runtime.sendMessage({ name: 'POPUP_CLOSED' });
  };
  const routesWithBackButton = ['/brand', '/card', '/amount', '/payment'];
  const showBackButton = routesWithBackButton.some(route => location.pathname.startsWith(route));
  return (
    <div className="header-bar fixed">
      {!showBackButton ? (
        <img className="bp-logo" alt="bitpay" src="../assets/icons/bp-logo-blue.svg" />
      ) : (
        <button className="back-button" type="button" onClick={goBack}>
          <img alt="go back" src="../assets/icons/go-back-icon.svg" />
        </button>
      )}

      {showBackButton ? <img className="bp-logo--solo" alt="bitpay" src="../assets/icons/b-logo-blue.svg" /> : null}

      <div className="header-bar__row">
        {!collapsed ? (
          <button type="button" onClick={collapse} style={{ marginRight: '7px' }}>
            <img alt="exit" src="../assets/icons/minimize-icon.svg" />
          </button>
        ) : (
          <button type="button" onClick={expand} style={{ marginRight: '7px' }}>
            <img alt="exit" src="../assets/icons/expand-icon.svg" />
          </button>
        )}

        <button type="button" onClick={close}>
          <img alt="exit" src="../assets/icons/exit-icon.svg" />
        </button>
      </div>
    </div>
  );
};

export default withRouter(Navbar);
