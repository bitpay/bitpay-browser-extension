import './account.scss';
import React, { useRef, useEffect, Dispatch, SetStateAction, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useTracking } from 'react-tracking';
import { browser } from 'webextension-polyfill-ts';
import { motion, AnimatePresence } from 'framer-motion';
import { BitpayUser } from '../../../../services/bitpay-id';
import { resizeToFitPage } from '../../../../services/frame';
import { set, get, remove } from '../../../../services/storage';
import {
  buttonAnimation,
  buttonTextAnimation,
  buttonSpinnerAnimation,
  spinAnimation
} from '../../../../services/animations';
import { IOSSwitch } from '../../../components/ios-switch/ios-switch';
import CardMenu from '../../../components/card-menu/card-menu';
import { SignInWithBitpayImage } from '../../../components/svg/sign-in-with-bitpay-image';
import Gravatar from '../../../components/gravatar/gravatar';
import { trackComponent } from '../../../../services/analytics';

const Account: React.FC<RouteComponentProps & {
  user?: BitpayUser;
  setUser: Dispatch<SetStateAction<BitpayUser | undefined>>;
}> = ({ user, setUser, history }) => {
  const tracking = useTracking();
  const ref = useRef<HTMLDivElement>(null);
  const [awaitingAuthentication, setAwaitingAuthentication] = useState(false);
  useEffect(() => {
    if (!awaitingAuthentication) return;
    const connectBitpayId = async (): Promise<void> => {
      tracking.trackEvent({ action: 'clickedSignInButton' });
      await browser.runtime.sendMessage({
        name: 'LAUNCH_WINDOW',
        url: `${process.env.API_ORIGIN}/wallet-card/login?context=bpa`,
        width: 350,
        height: 600
      });
      const newUser = await get<BitpayUser>('bitpayUser');
      if (!newUser) {
        setAwaitingAuthentication(false);
        tracking.trackEvent({ action: 'closedSignInPage' });
        return;
      }
      setUser(newUser);
      resizeToFitPage(ref, 49);
      tracking.trackEvent({ action: 'connectedAccount' });
    };
    connectBitpayId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [awaitingAuthentication]);
  const disconnect = async (): Promise<void> => {
    await remove('bitpayUser');
    setUser(undefined);
    history.goBack();
    tracking.trackEvent({ action: 'disconnectedAccount' });
  };
  const handleChange = async (): Promise<void> => {
    const updatedUser = { ...(user as BitpayUser), syncGiftCards: !user?.syncGiftCards };
    await set<BitpayUser>('bitpayUser', updatedUser);
    setUser(updatedUser);
    tracking.trackEvent({ action: updatedUser.syncGiftCards ? 'enabledSyncGiftCards' : 'disabledSyncGiftCards' });
  };
  useEffect(() => {
    resizeToFitPage(ref, 49);
  }, [ref]);
  return (
    <div className="settings account">
      <div ref={ref}>
        {user ? (
          <div className="account__linked">
            <CardMenu items={['Disconnect Account']} onClick={disconnect} />
            <div className="settings-group settings-group--no-border">
              <div className="settings-group__item settings-group__item--dark">
                <div className="settings-group__item__avatar">
                  <Gravatar email={user.email} size="34" />
                </div>
                <div className="settings-group__item__label ellipsis">
                  {user.givenName || user.givenName ? (
                    <>
                      <div className="name ellipsis">
                        {user.givenName} {user.familyName}
                      </div>
                      <div className="settings-group__item__note ellipsis">{user.email}</div>
                    </>
                  ) : (
                    <div className="email ellipsis">{user.email}</div>
                  )}
                </div>
              </div>
              <div className="settings-group__item">
                <div className="settings-group__item__label">Sync Gift Cards</div>
                <div className="settings-group__item__value">
                  <IOSSwitch checked={user.syncGiftCards || false} onChange={handleChange} name="Sync Gift Cards" />
                </div>
              </div>
              <div className="settings-group__caption">Back up your gift cards to use them across devices</div>
            </div>
          </div>
        ) : (
          <div className="account__zero-state">
            <div className="account__title">Connect Account</div>
            <div className="account__body">Use your account to sync gift cards, track your purchases, and more.</div>
            <AnimatePresence exitBeforeEnter>
              {awaitingAuthentication ? (
                <motion.div
                  className="action-button action-button--pending"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={buttonAnimation}
                  key="awaiting-authentication"
                >
                  <motion.span
                    className="d-flex"
                    variants={buttonSpinnerAnimation}
                    key="awaiting-authentication-wrapper"
                  >
                    <motion.img
                      className="action-button__spinner"
                      src="../../assets/icons/spinner.svg"
                      alt="spinner"
                      variants={spinAnimation}
                      key="awaiting-authentication-spinner"
                    />
                  </motion.span>
                  <motion.span variants={buttonTextAnimation} key="awaiting-authentication-text">
                    Awaiting Authentication
                  </motion.span>
                </motion.div>
              ) : (
                <motion.button
                  type="button"
                  className="account__zero-state__sign-in"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={buttonAnimation}
                  whileTap={{ scale: 0.98 }}
                  key="sign-in-with-bitpay"
                  onClick={(): void => setAwaitingAuthentication(true)}
                >
                  <SignInWithBitpayImage />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default trackComponent(Account, { page: 'account' });
