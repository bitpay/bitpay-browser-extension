import React, { useState } from 'react';
import { browser } from 'webextension-polyfill-ts';
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

console.log('parent', window.location);

const Popup: React.FC = () => {
  const parent = new URLSearchParams(window.location.search).get('url') as string;
  const initialEntries = parent.includes('google.com') ? ['/settings'] : ['/wallet'];
  const [loaded, setLoaded] = useState(false);
  setTimeout(() => setLoaded(true), 10);
  return (
    <div>
      {loaded ? (
        <Router initialEntries={initialEntries}>
          <Navbar />
          <Switch>
            {/* <Redirect from="/" to="/wallet" exact /> */}
            <Route path="/brand/:brand" component={Brand} />
            <Route path="/cards/:brand" component={Cards} />
            <Route path="/card/:id" component={Card} />
            <Route path="/wallet" component={Wallet} />
            <Route path="/shop" component={Shop} />
            <Route path="/settings" component={Settings} />
          </Switch>
          <Tabs />
        </Router>
      ) : null}
    </div>
  );
};

export default Popup;

async function saveAndFetchSampleData(): Promise<void> {
  await browser.storage.local.set({ howdy: 'therez' });
  const hi = await browser.storage.local.get('howdy');
  console.log('hi', hi);
}

saveAndFetchSampleData()
  .then()
  .catch();
