import React from 'react';
import { withRouter } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Navbar: React.FC<any> = ({ history, location }) => {
  const goBack = (): void => {
    history.goBack();
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
    </div>
  );
};

export default withRouter(Navbar);
