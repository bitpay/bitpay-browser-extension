/* eslint-disable jsx-a11y/no-autofocus */
import React, { useRef, useState, useEffect } from 'react';
import { resizeToFitPage } from '../../../../services/frame';
import { GiftCard, CardConfig } from '../../../../services/gift-card.types';
import CardHeader from '../../../components/card-header/card-header';
import './balance.scss';
import { getPrecision } from '../../../../services/currency';
import { getLatestBalanceEntry } from '../../../../services/gift-card';
import { wait } from '../../../../services/utils';
import CardMenu from '../../../components/card-menu/card-menu';

const Balance: React.FC<{
  updateGiftCard: (cards: GiftCard) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  history: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  location: any;
}> = ({ location, history, updateGiftCard }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    resizeToFitPage(ref, 80);
  }, [ref]);
  const { card, cardConfig, updateType = 'Amount Spent' } = location.state as {
    card: GiftCard;
    cardConfig: CardConfig;
    updateType: 'Amount Spent' | 'Remaining Balance';
  };
  const latestBalance = getLatestBalanceEntry(card).amount;
  const [formValid, setFormValid] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line no-unused-expressions
  inputRef.current?.focus();
  const step = getPrecision(cardConfig.currency) === 2 ? '0.01' : '1';
  const onEmailChange = (): void => {
    setFormValid(inputRef.current?.validity.valid || false);
  };
  const saveValue = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    const value = parseFloat(inputRef.current?.value as string);
    const amount = updateType === 'Amount Spent' ? latestBalance - value : value;
    const updatedCard = {
      ...card,
      balanceHistory: [...(card.balanceHistory || []), { date: new Date().toISOString(), amount }]
    };
    await updateGiftCard(updatedCard);
    history.goBack();
  };
  const handleMenuClick = async (option: string): Promise<void> => {
    await wait(100);
    history.goBack();
    history.push({
      pathname: `/card/${card.invoiceId}/balance`,
      state: { card, cardConfig, updateType: option.replace('Enter ', '') }
    });
  };
  return (
    <div className="card-details balance">
      <div ref={ref}>
        <CardMenu
          items={[updateType === 'Amount Spent' ? 'Enter Remaining Balance' : 'Enter Amount Spent']}
          onClick={handleMenuClick}
        />
        <CardHeader amount={latestBalance} cardConfig={cardConfig} card={card} />
        <form onSubmit={saveValue}>
          <div>
            <div className="settings-group">
              <div className="settings-group__label">{updateType}</div>
              <div className="settings-group__input">
                <input
                  type="number"
                  autoFocus
                  step={step}
                  min="0"
                  max={updateType === 'Amount Spent' ? latestBalance : ''}
                  required
                  onChange={onEmailChange}
                  ref={inputRef}
                />
              </div>
              {updateType === 'Amount Spent' ? (
                <div className="settings-group__caption">We'll automatically calculate what you have remaining</div>
              ) : null}
            </div>
          </div>
          <div style={{ padding: '0 15px' }}>
            <button type="submit" className="action-button" disabled={!formValid}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Balance;
