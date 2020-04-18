import React, { useState } from 'react';
import './navbar.scss';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { browser } from 'webextension-polyfill-ts';
import { motion, AnimatePresence } from 'framer-motion';
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
        <motion.button
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={collapsed ? expand : collapse}
          className="header-bar__controls__toggle--wrapper"
        >
          <AnimatePresence>
            <motion.img
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 180 }}
              alt="toggle"
              src={`../assets/icons/${collapsed ? 'expand' : 'minimize'}-icon.svg`}
              key={`${collapsed ? 'expand' : 'minimize'}`}
              className="header-bar__controls__toggle"
            />
          </AnimatePresence>
        </motion.button>

        <button type="button" onClick={close}>
          <img alt="exit" src="../assets/icons/exit-icon.svg" />
        </button>
      </div>
    </div>
  );
};

export default withRouter(Navbar);
