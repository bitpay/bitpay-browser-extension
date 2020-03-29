import React, { useState, useEffect } from 'react';
import { MemoryRouter as Router, Route, Switch } from 'react-router-dom';
import Brand from './pages/brand/brand';
import Card from './pages/card/card';
import Cards from './pages/cards/cards';
import Wallet from './pages/wallet/wallet';
import Settings from './pages/settings/settings';
import Shop from './pages/shop/shop';
import './styles.scss';
import Tabs from './components/tabs/tabs';
import Navbar from './components/navbar/navbar';
import { getMerchants, Merchant, getBitPayMerchantFromHost } from '../services/merchant';
import { CardConfig } from '../services/gift-card.types';
import Amount from './pages/amount/amount';
import Payment from './pages/payment/payment';
import { get } from '../services/storage';
import { getDirectIntegrations } from '../services/directory';

console.log('parent', window.location);

const Popup: React.FC = () => {
  const [initialEntries, setInitialEntries] = useState([{ pathname: '/shop' }]);
  const [loaded, setLoaded] = useState(false);
  const [merchants, setMerchants] = useState([] as Merchant[]);
  const [supportedMerchant, setSupportedMerchant] = useState(undefined as Merchant | undefined);

  useEffect(() => {
    const getStartPage = async (): Promise<void> => {
      const directIntegrations = await getDirectIntegrations();
      const availableGiftCardBrands = await get<CardConfig[]>('availableGiftCards');
      const allMerchants = getMerchants(directIntegrations, availableGiftCardBrands);
      const parent = new URLSearchParams(window.location.search).get('url') as string;
      const { host } = new URL(parent);
      const merchant = getBitPayMerchantFromHost(host, allMerchants);
      const initialPath = merchant ? `/wallet` : '/shop';
      setInitialEntries([{ pathname: initialPath || '/shop' }]);
      setMerchants(allMerchants);
      setSupportedMerchant(merchant);
      setLoaded(true);
    };
    getStartPage();
  }, []);
  return (
    <div>
      {loaded ? (
        <Router initialEntries={initialEntries}>
          <Navbar />
          <Switch>
            <Route path="/amount/:brand" component={Amount} />
            <Route path="/brand/:brand" component={Brand} />
            <Route path="/cards/:brand" component={Cards} />
            <Route path="/card/:id" component={Card} />
            <Route path="/payment/:brand" component={Payment} />
            <Route path="/shop" render={(props): JSX.Element => <Shop merchants={merchants} {...props} />} />
            <Route path="/settings" component={Settings} />
            <Route
              path="/wallet"
              render={(props): JSX.Element => <Wallet supportedMerchant={supportedMerchant} {...props} />}
            />
          </Switch>
          <Tabs />
        </Router>
      ) : null}
    </div>
  );
};

export default Popup;
