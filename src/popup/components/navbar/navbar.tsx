import React, { useState, useEffect } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { useTracking } from 'react-tracking';
import { browser } from 'webextension-polyfill-ts';
import { motion, AnimatePresence } from 'framer-motion';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { resizeFrame, FrameDimensions } from '../../../services/frame';
import { trackComponent } from '../../../services/analytics';
import './navbar.scss';

import BitpayLogo from './bp-logo/bp-logo';
import BackButton from './back-button/back-button';

const Navbar: React.FC<RouteComponentProps> = ({ history, location }) => {
  const tracking = useTracking();
  const [preCollapseHeight, setPreCollapseHeight] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const goBack = (): void => {
    if (collapsed) {
      setCollapsed(false);
    }
    history.goBack();
    tracking.trackEvent({ action: 'clickedBackButton' });
  };
  const collapse = (): void => {
    setPreCollapseHeight(document.body.offsetHeight);
    setCollapsed(true);
    resizeFrame(FrameDimensions.collapsedHeight);
    tracking.trackEvent({ action: 'collapsedWidget' });
  };
  const expand = (): void => {
    setCollapsed(false);
    resizeFrame(preCollapseHeight);
    tracking.trackEvent({ action: 'expandedWidget' });
  };
  const close = (): void => {
    tracking.trackEvent({ action: 'closedWidget' });
    browser.runtime.sendMessage({ name: 'POPUP_CLOSED' });
  };
  const routesWithBackButton = ['/brand', '/card', '/amount', '/payment', '/settings/', '/category'];
  const showBackButton = routesWithBackButton.some(route => location.pathname.startsWith(route));
  useEffect(() => {
    fromEvent<MessageEvent>(window, 'message')
      .pipe(debounceTime(1000))
      .subscribe(() => tracking.trackEvent({ action: 'draggedWidget' }));
  }, [tracking]);
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

export default withRouter(trackComponent(Navbar));
