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
  return (
    <div className="header-bar fixed">
      <BackButton show={showBackButton} onClick={goBack} />
      <BitpayLogo solo={showBackButton} />
      <Toggle collapsed={collapsed} expand={expand} collapse={collapse} close={close} />
    </div>
  );
};

export default withRouter(trackComponent(Navbar));
