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
  const routesWithBackButton = ['/brand', '/card'];
  const showBackButton = routesWithBackButton.some(route => location.pathname.startsWith(route));
  return (
    <div className="navbar">
      {showBackButton ? (
        <button type="button" onClick={goBack}>
          &larr; Back &nbsp; &nbsp;
        </button>
      ) : (
        <div />
      )}
      <div>Navbar</div>
      &nbsp;&nbsp;
      {!collapsed ? (
        <button type="button" onClick={collapse}>
          -
        </button>
      ) : (
        <button type="button" onClick={expand}>
          +
        </button>
      )}
      &nbsp;&nbsp;
      <button type="button" onClick={close}>
        x
      </button>
    </div>
  );
};

export default withRouter(Navbar);
