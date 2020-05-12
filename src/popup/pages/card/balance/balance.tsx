/* eslint-disable jsx-a11y/no-autofocus */
import React, { useRef, useState, useEffect } from 'react';
import { useTracking } from 'react-tracking';
import { RouteComponentProps } from 'react-router-dom';
import { resizeToFitPage } from '../../../../services/frame';
import { GiftCard, CardConfig } from '../../../../services/gift-card.types';
import CardHeader from '../../../components/card-header/card-header';
import './balance.scss';
import { getPrecision } from '../../../../services/currency';
import { getLatestBalanceEntry } from '../../../../services/gift-card';
import { wait } from '../../../../services/utils';
import CardMenu from '../../../components/card-menu/card-menu';
import ActionButton from '../../../components/action-button/action-button';
import { trackComponent } from '../../../../services/analytics';

const Balance: React.FC<RouteComponentProps & {
  updateGiftCard: (cards: GiftCard) => void;
}> = ({ location, history, updateGiftCard }) => {
  const tracking = useTracking();
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
  const min = updateType === 'Remaining Balance' ? 0 : step;
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
    tracking.trackEvent({ action: 'changedBalance', type: updateType, gaAction: `changedBalance:${updateType}` });
    history.goBack();
  };
  const handleMenuClick = async (option: string): Promise<void> => {
    await wait(100);
    const type = option.replace('Enter ', '');
    tracking.trackEvent({ action: 'changedBalanceUpdateType', type });
    history.goBack();
    history.push({
      pathname: `/card/${card.invoiceId}/balance`,
      state: { card, cardConfig, updateType: type }
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
                  min={min}
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
          <div className="balance__button">
            <ActionButton type="submit" disabled={!formValid}>
              Save
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default trackComponent(Balance, { page: 'balance' });
