import React, { useState } from 'react';
import './navbar.scss';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { browser } from 'webextension-polyfill-ts';
import { AnimatePresence } from 'framer-motion';
import { resizeFrame, FrameDimensions } from '../../../services/frame';

import BitpayLogo from './bp-logo/bp-logo';
import BackButton from './back-button/back-button';

const Navbar: React.FC<RouteComponentProps> = ({ history, location }) => {
  const [preCollapseHeight, setPreCollapseHeight] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const goBack = (): void => {
    if (collapsed) {
      setCollapsed(false);
    }
    history.goBack();
  };
  const collapse = (): void => {
    setPreCollapseHeight(document.body.offsetHeight);
    setCollapsed(true);
    resizeFrame(FrameDimensions.collapsedHeight);
  };
  const expand = (): void => {
    setCollapsed(false);
    resizeFrame(preCollapseHeight);
  };
  const close = (): void => {
    browser.runtime.sendMessage({ name: 'POPUP_CLOSED' });
  };
  const routesWithBackButton = ['/brand', '/card', '/amount', '/payment', '/settings/'];
  const showBackButton = routesWithBackButton.some(route => location.pathname.startsWith(route));
  return (
    <div className="header-bar fixed">
      <AnimatePresence>{showBackButton && <BackButton onClick={goBack} />}</AnimatePresence>

      <BitpayLogo solo={showBackButton} />

      <div className="header-bar__controls">
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
