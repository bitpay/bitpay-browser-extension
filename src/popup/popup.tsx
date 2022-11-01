import React, { useState, useEffect, useRef } from 'react';
import { MemoryRouter as Router, Route, Switch } from 'react-router-dom';
import track, { useTracking } from 'react-tracking';
import { skip } from 'rxjs/operators';
import Category from './pages/category/category';
import Brand from './pages/brand/brand';
import Card from './pages/card/card';
import Cards from './pages/cards/cards';
import Country from './pages/country/country';
import Wallet from './pages/wallet/wallet';
import Settings from './pages/settings/settings';
import Shop from './pages/shop/shop';
import Tabs from './components/tabs/tabs';
import Navbar from './components/navbar/navbar';
import {
  Merchant,
  getBitPayMerchantFromUrl,
  fetchCachedMerchants,
  getMerchantInitialEntries,
  fetchDirectoryAndMerchants
} from '../services/merchant';
import Amount from './pages/amount/amount';
import Payment from './pages/payment/payment';
import Phone from './pages/phone/phone';
import { get } from '../services/storage';
import { GiftCard, CardConfig, PhoneCountryInfo } from '../services/gift-card.types';
import { sortByDescendingDate, getCountry } from '../services/gift-card';
import {
  updateCard,
  listenForInvoiceChanges,
  handlePaymentEvent,
  createEventSourceObservable
} from '../services/gift-card-storage';
import Email from './pages/settings/email/email';
import Archive from './pages/settings/archive/archive';
import Legal from './pages/settings/legal/legal';
import Balance from './pages/card/balance/balance';
import { BitpayUser } from '../services/bitpay-id';
import Account from './pages/settings/account/account';
import { refreshMerchantCache, dispatchAnalyticsEvent } from '../services/browser';
import { Directory, saturateDirectory, getCachedDirectory } from '../services/directory';
import './styles.scss';

const Popup: React.FC = () => {
  const tracking = useTracking();
  const [amount, setAmount] = useState(0);
  const [initialEntries, setInitialEntries] = useState([{ pathname: '/shop', state: {} }]);
  const [initialIndex, setInitialIndex] = useState(0);
  const popupLaunchTime = useRef(Date.now());
  const parentUrl = useRef(new URLSearchParams(window.location.search).get('url') as string);
  const initiallyCollapsed =
    (new URLSearchParams(window.location.search).get('initiallyCollapsed') as string) === 'true';
  const [loaded, setLoaded] = useState(false);
  const [clientId, setClientId] = useState('');
  const [country, setCountry] = useState('US');
  const [email, setEmail] = useState('');
  const [directory, setDirectory] = useState({} as Directory);
  const [merchants, setMerchants] = useState([] as Merchant[]);
  const [phone, setPhone] = useState('');
  const [phoneCountryInfo, setPhoneCountryInfo] = useState({ phoneCountryCode: '1', countryIsoCode: 'US' } as
    | PhoneCountryInfo
    | undefined);
  const [supportedMerchant, setSupportedMerchant] = useState(undefined as Merchant | undefined);
  const [supportedGiftCards, setSupportedGiftCards] = useState([] as CardConfig[]);
  const [promptAtCheckout, setPromptAtCheckout] = useState(true as boolean);
  const [purchasedGiftCards, setPurchasedGiftCards] = useState([] as GiftCard[]);
  const [realtimeInvoiceIds, setRealtimeInvoiceIds] = useState([] as string[]);
  const [user, setUser] = useState(undefined as BitpayUser | undefined);

  const updateGiftCard = async (card: GiftCard): Promise<void> => {
    const newCards = await updateCard(card, purchasedGiftCards);
    setPurchasedGiftCards(newCards);
  };

  useEffect(() => {
    if (Date.now() - popupLaunchTime.current < 1000) return;
    const updateMerchants = async (): Promise<void> => {
      const [newDirectory, newMerchants] = await fetchDirectoryAndMerchants();
      setDirectory(saturateDirectory(newDirectory, newMerchants));
      setMerchants(newMerchants);
      setSupportedMerchant(getBitPayMerchantFromUrl(parentUrl.current, newMerchants));
      const newSupportedGiftCards = await get<CardConfig[]>('supportedGiftCards');
      setSupportedGiftCards(newSupportedGiftCards);
      refreshMerchantCache();
    };
    updateMerchants()
      .then()
      .catch(err => console.log('Error updating merchants after user change', err));
  }, [user]);

  useEffect(() => {
    const attemptToRedeemGiftCards = (): void => {
      const justCreated = (card: GiftCard): boolean =>
        card.status === 'UNREDEEMED' && Date.now() - new Date(card.date).getTime() < 1000;
      const unredeemedGiftCards = purchasedGiftCards.filter(
        c => c.status === 'UNREDEEMED' && !justCreated(c) && !realtimeInvoiceIds.includes(c.invoiceId)
      );
      const justCreatedGiftCards = purchasedGiftCards.filter(c => justCreated(c));
      if (unredeemedGiftCards.length) {
        setRealtimeInvoiceIds([...realtimeInvoiceIds, ...unredeemedGiftCards.map(c => c.invoiceId)]);
        unredeemedGiftCards.forEach(async card => {
          const updatedInvoice = await listenForInvoiceChanges({ unredeemedGiftCard: card, user }).catch(
            () => undefined
          );
          if (!updatedInvoice) return;
          const newCards = await handlePaymentEvent(card, updatedInvoice, purchasedGiftCards);
          setPurchasedGiftCards(newCards);
        });
      }
      justCreatedGiftCards.forEach(async card => {
        const alreadyFinalized = (c: GiftCard): boolean => ['SUCCESS', 'FAILURE'].includes(c.status);
        const source = await createEventSourceObservable({ invoiceId: card.invoiceId, user }).catch(() => undefined);
        if (!source) return;
        const subscription = source.pipe(skip(1)).subscribe(async updatedInvoice => {
          const giftCard = purchasedGiftCards.find(c => c.invoiceId === card.invoiceId);
          if (!giftCard || alreadyFinalized(giftCard)) {
            subscription.unsubscribe();
            return;
          }
          const newCards = await handlePaymentEvent(giftCard, updatedInvoice, purchasedGiftCards);
          const updatedCard = newCards.find(newCard => card.invoiceId === newCard.invoiceId);
          setPurchasedGiftCards(newCards);
          if (updatedCard && alreadyFinalized(updatedCard)) {
            subscription.unsubscribe();
          }
        });
      });
    };
    attemptToRedeemGiftCards();
  }, [purchasedGiftCards, realtimeInvoiceIds]);

  useEffect(() => {
    const getStartPage = async (): Promise<void> => {
      const [
        directoryIndex,
        countryCode,
        allMerchants,
        allSupportedGiftCards,
        allPurchasedGiftCards,
        receiptEmail,
        bitpayUser,
        extensionClientId,
        shouldPromptAtCheckout
      ] = await Promise.all([
        getCachedDirectory(),
        getCountry(),
        fetchCachedMerchants(),
        get<CardConfig[]>('supportedGiftCards'),
        get<GiftCard[]>('purchasedGiftCards'),
        get<string>('email'),
        get<BitpayUser>('bitpayUser'),
        get<string>('clientId'),
        get<boolean>('promptAtCheckout')
      ]);
      const [phoneNumber, phoneCountryObject] = await Promise.all([
        get<string>('phone'),
        get<PhoneCountryInfo>('phoneCountryInfo')
      ]);
      const orderTotal = parseFloat(new URLSearchParams(window.location.search).get('amount') as string);
      const merchant = getBitPayMerchantFromUrl(parentUrl.current, allMerchants);
      const entries = getMerchantInitialEntries({ merchant, extensionClientId, bitpayUser, receiptEmail, orderTotal });
      setInitialEntries(entries);
      setInitialIndex(entries.length - 1);
      setAmount(orderTotal);
      setCountry(countryCode);
      setDirectory(saturateDirectory(directoryIndex, allMerchants));
      setMerchants(allMerchants);
      setSupportedMerchant(merchant);
      setSupportedGiftCards(allSupportedGiftCards || []);
      setPromptAtCheckout(typeof shouldPromptAtCheckout === 'undefined' ? true : shouldPromptAtCheckout);
      setPurchasedGiftCards((allPurchasedGiftCards || []).sort(sortByDescendingDate));
      setClientId(extensionClientId);
      setEmail(receiptEmail);
      setPhone((phoneNumber || '').replace((phoneCountryObject && phoneCountryObject.phoneCountryCode) || '', ''));
      setPhoneCountryInfo(phoneCountryObject);
      setUser(bitpayUser);
      setLoaded(true);
      tracking.trackEvent({ action: 'openedWidget' });
    };
    getStartPage();
  }, [tracking]);
  return (
    <>
      {loaded && (
        <Router initialEntries={initialEntries} initialIndex={initialIndex}>
          <Navbar initiallyCollapsed={initiallyCollapsed} />
          <Switch>
            <Route
              path="/amount/:brand"
              render={(props): JSX.Element => (
                <Amount
                  clientId={clientId}
                  email={email}
                  initialAmount={amount}
                  initiallyCollapsed={initiallyCollapsed}
                  purchasedGiftCards={purchasedGiftCards}
                  setPurchasedGiftCards={setPurchasedGiftCards}
                  supportedMerchant={supportedMerchant}
                  user={user}
                  {...props}
                />
              )}
            />
            <Route
              path="/category/:category"
              render={(props): JSX.Element => <Category merchants={merchants} {...props} />}
            />
            <Route
              path="/brand/:brand"
              render={(props): JSX.Element => <Brand directory={directory} key={props.location.pathname} {...props} />}
            />
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
              path="/country"
              render={(props): JSX.Element => <Country setPhoneCountryInfo={setPhoneCountryInfo} {...props} />}
            />
            <Route
              path="/payment/:brand"
              render={(props): JSX.Element => (
                <Payment
                  setEmail={setEmail}
                  user={user}
                  purchasedGiftCards={purchasedGiftCards}
                  setPurchasedGiftCards={setPurchasedGiftCards}
                  supportedMerchant={supportedMerchant}
                  initiallyCollapsed={initiallyCollapsed}
                  {...props}
                />
              )}
            />
            <Route
              path="/phone"
              render={(props): JSX.Element => (
                <Phone
                  country={country}
                  phone={phone}
                  phoneCountryInfo={phoneCountryInfo}
                  setPhoneCountryInfo={setPhoneCountryInfo}
                  setPhone={setPhone}
                  {...props}
                />
              )}
            />
            <Route
              path="/shop"
              render={(props): JSX.Element => <Shop directory={directory} merchants={merchants} {...props} />}
            />
            <Route
              path="/settings"
              exact
              render={(props): JSX.Element => (
                <Settings
                  email={email}
                  clientId={clientId}
                  user={user as BitpayUser}
                  promptAtCheckout={promptAtCheckout}
                  setPromptAtCheckout={setPromptAtCheckout}
                  {...props}
                />
              )}
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

export default track(
  {},
  {
    dispatch: event => dispatchAnalyticsEvent(event),
    process: componentTrackingData => (componentTrackingData.page ? { action: 'viewedPage' } : null)
  }
)(Popup);
