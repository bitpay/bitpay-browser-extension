import React from 'react';
import { browser } from 'webextension-polyfill-ts';

import './styles.scss';

const Popup: React.FC = () => {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        color: '#384366'
      }}
    >
      Change the 🌎
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
