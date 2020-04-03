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
import { Merchant, getBitPayMerchantFromHost, fetchCachedMerchants } from '../services/merchant';
import Amount from './pages/amount/amount';
import Payment from './pages/payment/payment';
import { get } from '../services/storage';
import { GiftCard, CardConfig } from '../services/gift-card.types';
import { sortByDescendingDate } from '../services/gift-card';

const Popup: React.FC = () => {
  const [initialEntries, setInitialEntries] = useState(['/shop']);
  const [loaded, setLoaded] = useState(false);
  const [clientId, setClientId] = useState('' as string);
  const [merchants, setMerchants] = useState([] as Merchant[]);
  const [supportedMerchant, setSupportedMerchant] = useState(undefined as Merchant | undefined);
  const [supportedGiftCards, setSupportedGiftCards] = useState([] as CardConfig[]);
  const [purchasedGiftCards, setPurchasedGiftCards] = useState([] as GiftCard[]);

  const updatePurchasedGiftCards = async (cards: GiftCard[]): Promise<void> => {
    setPurchasedGiftCards(cards);
  };

  useEffect(() => {
    const getStartPage = async (): Promise<void> => {
      const [allMerchants, allSupportedGiftCards, allPurchasedGiftCards] = await Promise.all([
        fetchCachedMerchants(),
        get<CardConfig[]>('availableGiftCards'),
        get<GiftCard[]>('purchasedGiftCards')
      ]);
      console.log('allMerchants', allMerchants);
      console.log('allSupportedGiftCards', allSupportedGiftCards);
      console.log('allPurchasedGiftCards', allPurchasedGiftCards);
      const parent = new URLSearchParams(window.location.search).get('url') as string;
      const { host } = new URL(parent);
      const merchant = getBitPayMerchantFromHost(host, allMerchants);
      const initialPath = merchant ? `/wallet` : '/shop';
      setInitialEntries([initialPath || '/shop']);
      setMerchants(allMerchants);
      setSupportedMerchant(merchant);
      setSupportedGiftCards(allSupportedGiftCards || []);
      setPurchasedGiftCards((allPurchasedGiftCards || []).sort(sortByDescendingDate));
      setClientId(await get<string>('clientId'));
      setLoaded(true);
    };
    getStartPage();
  }, []);
  return (
    <>
      {loaded ? (
        <Router initialEntries={initialEntries}>
          <Navbar />
          <Switch>
            <Route
              path="/amount/:brand"
              render={(props): JSX.Element => (
                <Amount clientId={clientId} updatePurchasedGiftCards={updatePurchasedGiftCards} {...props} />
              )}
            />
            <Route path="/brand/:brand" component={Brand} />
            <Route
              path="/cards/:brand"
              render={(props): JSX.Element => <Cards purchasedGiftCards={purchasedGiftCards} {...props} />}
            />
            <Route
              path="/card/:id"
              render={(props): JSX.Element => <Card updatePurchasedGiftCards={updatePurchasedGiftCards} {...props} />}
            />
            <Route path="/payment/:brand" component={Payment} />
            <Route path="/shop" render={(props): JSX.Element => <Shop merchants={merchants} {...props} />} />
            <Route path="/settings" component={Settings} />
            <Route
              path="/wallet"
              render={(props): JSX.Element => (
                <Wallet
                  supportedMerchant={supportedMerchant}
                  supportedGiftCards={supportedGiftCards}
                  purchasedGiftCards={purchasedGiftCards}
                  {...props}
                />
              )}
            />
          </Switch>
          <Tabs />
        </Router>
      ) : null}
    </>
  );
};

export default Popup;
