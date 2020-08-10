/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useEffect } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { useTracking } from 'react-tracking';
import { browser } from 'webextension-polyfill-ts';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { resizeFrame, FrameDimensions } from '../../../services/frame';
import { trackComponent } from '../../../services/analytics';
import './navbar.scss';

import BitpayLogo from './bp-logo/bp-logo';
import BackButton from './back-button/back-button';
import Toggle from './toggle/toggle';

const Navbar: React.FC<RouteComponentProps & { initiallyCollapsed: boolean }> = ({
  history,
  location,
  initiallyCollapsed
}) => {
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
  const routesWithPayMode = ['/amount', '/payment'];
  const inPaymentFlow = routesWithPayMode.some(route => location.pathname.startsWith(route));
  const payMode = collapsed && inPaymentFlow;
  const handleLogoClick = (): void => {
    if (payMode) expand();
  };
  browser.runtime.sendMessage({ name: 'NAVBAR_MODE_CHANGED', mode: payMode ? 'pay' : 'default' });
  useEffect(() => {
    fromEvent<MessageEvent>(window, 'message')
      .pipe(debounceTime(1000))
      .subscribe(() => tracking.trackEvent({ action: 'draggedWidget' }));
  }, [tracking]);
  useEffect(() => {
    if (!initiallyCollapsed) return;
    collapse();
    setPreCollapseHeight(FrameDimensions.amountPageHeight);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className={`header-bar fixed ${payMode ? 'fixed--dark' : ''}`}>
      {payMode && <div className="pay-click-handler" onClick={handleLogoClick} />}
      <BackButton show={!collapsed && showBackButton} onClick={goBack} />
      <BitpayLogo solo={!collapsed && showBackButton} payMode={payMode} />
      <Toggle collapsed={collapsed} expand={expand} collapse={collapse} close={close} payMode={payMode} />
    </div>
  );
};

export default withRouter(trackComponent(Navbar));
