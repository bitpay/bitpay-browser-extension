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

const Navbar: React.FC<RouteComponentProps> = ({ history, location }) => {
  const tracking = useTracking();
  const [preCollapseHeight, setPreCollapseHeight] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [payMode, setPayMode] = useState(false);
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
  const showBackButton = routesWithBackButton.some((route) => location.pathname.startsWith(route));
  useEffect(() => {
    fromEvent<MessageEvent>(window, 'message')
      .pipe(debounceTime(1000))
      .subscribe(() => tracking.trackEvent({ action: 'draggedWidget' }));
  }, [tracking]);
  useEffect(() => {
    const payReady = (mode: boolean) => (): void => setPayMode(mode);
    window.addEventListener('PAY_VISIBLE', payReady(true));
    window.addEventListener('PAY_HIDDEN', payReady(false));
    return (): void => {
      window.removeEventListener('PAY_VISIBLE', payReady(true));
      window.removeEventListener('PAY_HIDDEN', payReady(false));
    };
  }, []);
  return (
    <div className={`header-bar fixed ${collapsed && payMode ? 'fixed--dark' : ''}`}>
      <BackButton show={!collapsed && showBackButton} onClick={goBack} />
      <BitpayLogo solo={!collapsed && showBackButton} payMode={collapsed && payMode} />
      <Toggle collapsed={collapsed} expand={expand} collapse={collapse} close={close} payMode={collapsed && payMode} />
    </div>
  );
};

export default withRouter(trackComponent(Navbar));
