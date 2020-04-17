import React, { useRef, useEffect, Dispatch, SetStateAction, useState } from 'react';
import { browser } from 'webextension-polyfill-ts';
import { BitpayUser } from '../../../../services/bitpay-id';
import { resizeToFitPage } from '../../../../services/frame';
import { IOSSwitch } from '../../../components/ios-switch/ios-switch';
import { set, get, remove } from '../../../../services/storage';
import './account.scss';
import CardMenu from '../../../components/card-menu/card-menu';

const Account: React.FC<{
  user?: BitpayUser;
  setUser: Dispatch<SetStateAction<BitpayUser | undefined>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  history: any;
}> = ({ user, setUser, history }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [awaitingAuthentication, setAwaitingAuthentication] = useState(false);
  const connectBitpayId = async (): Promise<void> => {
    setAwaitingAuthentication(true);
    await browser.runtime.sendMessage({
      name: 'LAUNCH_WINDOW',
      url: `${process.env.API_ORIGIN}/wallet-card/login?context=bpa`,
      width: 350,
      height: 600
    });
    const newUser = await get<BitpayUser>('bitpayUser');
    if (!newUser) {
      setAwaitingAuthentication(false);
      return;
    }
    setUser(newUser);
    resizeToFitPage(ref, 49);
  };
  const disconnect = async (): Promise<void> => {
    await remove('bitpayUser');
    setUser(undefined);
    history.goBack();
  };
  const handleChange = async (): Promise<void> => {
    const updatedUser = { ...(user as BitpayUser), syncGiftCards: !user?.syncGiftCards };
    await set<BitpayUser>('bitpayUser', updatedUser);
    setUser(updatedUser);
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
            <div className="settings-group">
              <div className="settings-group__item settings-group__item--dark" style={{ height: '70px' }}>
                <img
                  className="settings-group__item__avatar"
                  alt="BitPay Logo"
                  src="assets/icons/favicon-active-128.png"
                />
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
            <button type="button" className="account__title" onClick={connectBitpayId}>
              Connect Account
            </button>
            <div className="account__body">Use your account to sync gift cards, track your purchases, and more.</div>
            {awaitingAuthentication ? (
              <div className="action-button action-button--pending">
                <img className="action-button__spinner" src="../../assets/icons/spinner.svg" alt="spinner" /> Awaiting
                Authentication
              </div>
            ) : (
              <button type="button" onClick={connectBitpayId} style={{ display: 'block', height: '60px' }}>
                <img src="assets/sign-in-with-bitpay.svg" alt="Sign in with BitPay" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;
