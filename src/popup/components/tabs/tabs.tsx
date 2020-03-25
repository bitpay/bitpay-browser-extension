import React from 'react';
import { NavLink, withRouter } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Tabs: React.FC<any> = ({ location: { pathname } }) => {
  const routesVisible = ['/wallet', '/shop', '/settings'];
  const shouldShow = routesVisible.includes(pathname);
  return shouldShow ? (
    <div className="tabs">
      <NavLink to="/wallet" activeClassName="is-active">
        <div>wallet</div>
      </NavLink>
      <NavLink to="/shop" activeClassName="is-active">
        <div>shop</div>
      </NavLink>
      <NavLink to="/settings" activeClassName="is-active">
        <div>settings</div>
      </NavLink>
    </div>
  ) : (
    <div />
  );
};

export default withRouter(Tabs);
