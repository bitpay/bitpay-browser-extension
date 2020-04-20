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
import { Merchant, getBitPayMerchantFromHost, fetchCachedMerchants, fetchMerchants } from '../services/merchant';
import Amount from './pages/amount/amount';
import Payment from './pages/payment/payment';
import { get } from '../services/storage';
import { GiftCard, CardConfig } from '../services/gift-card.types';
import { sortByDescendingDate } from '../services/gift-card';
import { updateCard, listenForInvoiceChanges, handlePaymentEvent } from '../services/gift-card-storage';
import Email from './pages/settings/email/email';
import Archive from './pages/settings/archive/archive';
import Legal from './pages/settings/legal/legal';
import Balance from './pages/card/balance/balance';
import { BitpayUser } from '../services/bitpay-id';
import Account from './pages/settings/account/account';

const Popup: React.FC = () => {
  const [initialEntries, setInitialEntries] = useState(['/shop']);
  const [loaded, setLoaded] = useState(false);
  const [clientId, setClientId] = useState('');
  const [email, setEmail] = useState('');
  const [merchants, setMerchants] = useState([] as Merchant[]);
  const [supportedMerchant, setSupportedMerchant] = useState(undefined as Merchant | undefined);
  const [supportedGiftCards, setSupportedGiftCards] = useState([] as CardConfig[]);
  const [purchasedGiftCards, setPurchasedGiftCards] = useState([] as GiftCard[]);
  const [realtimeInvoiceIds, setRealtimeInvoiceIds] = useState([] as string[]);
  const [parentUrl, setParentUrl] = useState('');
  const [user, setUser] = useState(undefined as BitpayUser | undefined);

  const getMerchantFromUrl = (url: string, allMerchants: Merchant[]): Merchant | undefined => {
    const { host } = new URL(url);
    return getBitPayMerchantFromHost(host, allMerchants);
  };

  const updateGiftCard = async (card: GiftCard): Promise<void> => {
    const newCards = await updateCard(card, purchasedGiftCards);
    setPurchasedGiftCards(newCards);
  };

  useEffect(() => {
    const updateMerchants = async (): Promise<void> => {
      const newMerchants = await fetchMerchants();
      setMerchants(newMerchants);
      setSupportedMerchant(getMerchantFromUrl(parentUrl, newMerchants));
      const newSupportedGiftCards = await get<CardConfig[]>('supportedGiftCards');
      setSupportedGiftCards(newSupportedGiftCards);
    };
    if (parentUrl) updateMerchants();
  }, [user, parentUrl]);

  useEffect(() => {
    const attemptToRedeemGiftCards = (): void => {
      const unredeemedGiftCards = purchasedGiftCards.filter(
        c =>
          c.status === 'UNREDEEMED' &&
          Date.now() - new Date(c.date).getTime() > 1000 &&
          !realtimeInvoiceIds.includes(c.invoiceId)
      );
      if (!unredeemedGiftCards.length) return;
      setRealtimeInvoiceIds([...realtimeInvoiceIds, ...unredeemedGiftCards.map(c => c.invoiceId)]);
      unredeemedGiftCards.forEach(async card => {
        const updatedInvoice = await listenForInvoiceChanges(card);
        const newCards = await handlePaymentEvent(card, updatedInvoice, purchasedGiftCards);
        setPurchasedGiftCards(newCards);
      });
    };
    attemptToRedeemGiftCards();
  }, [purchasedGiftCards, realtimeInvoiceIds]);

  useEffect(() => {
    const getStartPage = async (): Promise<void> => {
      const [allMerchants, allSupportedGiftCards, allPurchasedGiftCards, receiptEmail, bitpayUser] = await Promise.all([
        fetchCachedMerchants(),
        get<CardConfig[]>('supportedGiftCards'),
        get<GiftCard[]>('purchasedGiftCards'),
        get<string>('email'),
        get<BitpayUser>('bitpayUser')
      ]);
      const parent = new URLSearchParams(window.location.search).get('url') as string;
      setParentUrl(parent);
      const merchant = getMerchantFromUrl(parent, allMerchants);
      const initialPath = merchant ? `/wallet` : '/shop';
      setInitialEntries([initialPath || '/shop']);
      setMerchants(allMerchants);
      setSupportedMerchant(merchant);
      setSupportedGiftCards(allSupportedGiftCards || []);
      setPurchasedGiftCards((allPurchasedGiftCards || []).sort(sortByDescendingDate));
      setClientId(await get<string>('clientId'));
      setEmail(receiptEmail);
      setUser(bitpayUser);
      setLoaded(true);
    };
    getStartPage();
  }, []);
  return (
    <>
      {loaded && (
        <Router initialEntries={initialEntries}>
          <Navbar />
          <Switch>
            <Route
              path="/amount/:brand"
              render={(props): JSX.Element => (
                <Amount
                  clientId={clientId}
                  email={email}
                  purchasedGiftCards={purchasedGiftCards}
                  setPurchasedGiftCards={setPurchasedGiftCards}
                  user={user}
                  {...props}
                />
              )}
            />
            <Route path="/brand/:brand" component={Brand} />
            <Route
              path="/cards/:brand"
              render={(props): JSX.Element => (
                <Cards purchasedGiftCards={purchasedGiftCards} merchants={merchants} {...props} />
              )}
            />
            <Route
              path="/card/:id"
              exact
              render={(props): JSX.Element => (
                <Card purchasedGiftCards={purchasedGiftCards} updateGiftCard={updateGiftCard} {...props} />
              )}
            />
            <Route
              path="/card/:id/balance"
              render={(props): JSX.Element => <Balance updateGiftCard={updateGiftCard} {...props} />}
            />
            <Route
              path="/payment/:brand"
              render={(props): JSX.Element => (
                <Payment
                  clientId={clientId}
                  email={email}
                  setEmail={setEmail}
                  user={user}
                  purchasedGiftCards={purchasedGiftCards}
                  setPurchasedGiftCards={setPurchasedGiftCards}
                  {...props}
                />
              )}
            />
            <Route path="/shop" render={(props): JSX.Element => <Shop merchants={merchants} {...props} />} />
            <Route
              path="/settings"
              exact
              render={(props): JSX.Element => <Settings email={email} user={user as BitpayUser} {...props} />}
            />
            <Route
              path="/settings/archive"
              render={(props): JSX.Element => (
                <Archive supportedGiftCards={supportedGiftCards} purchasedGiftCards={purchasedGiftCards} {...props} />
              )}
            />
            <Route
              path="/settings/email"
              render={(props): JSX.Element => <Email email={email} setEmail={setEmail} {...props} />}
            />
            <Route path="/settings/legal" component={Legal} />
            <Route
              path="/settings/account"
              render={(props): JSX.Element => <Account user={user} setUser={setUser} {...props} />}
            />
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
      )}
    </>
  );
};

export default Popup;
