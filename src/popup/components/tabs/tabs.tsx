import React from 'react';
import { NavLink, withRouter, RouteComponentProps } from 'react-router-dom';

const Tabs: React.FC<RouteComponentProps> = ({ location: { pathname } }) => {
  const routesVisible = ['/wallet', '/shop', '/settings'];
  const shouldShow = routesVisible.includes(pathname);

  return (
    shouldShow && (
      <div className="tab-bar">
        <NavLink to="/wallet" activeClassName="is-active">
          <img className="inactive" alt="wallet" src="../assets/icons/wallet-icon.svg" />
          <img className="active" alt="wallet" src="../assets/icons/wallet-icon--active.svg" />
        </NavLink>
        <NavLink to="/shop" activeClassName="is-active">
          <img className="inactive" alt="shop" src="../assets/icons/shop-icon.svg" />
          <img className="active" alt="shop" src="../assets/icons/shop-icon--active.svg" />
        </NavLink>
        <NavLink to="/settings" activeClassName="is-active">
          <img className="inactive" alt="settings" src="../assets/icons/settings-icon.svg" />
          <img className="active" alt="settings" src="../assets/icons/settings-icon--active.svg" />
        </NavLink>
      </div>
    )
  );
};

export default withRouter(Tabs);
