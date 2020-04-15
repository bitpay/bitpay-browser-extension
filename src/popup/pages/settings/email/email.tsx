/* eslint-disable jsx-a11y/no-autofocus */
import React, { useRef, useState } from 'react';
import { resizeFrame } from '../../../../services/frame';
import { set } from '../../../../services/storage';
import ActionButton from '../../../components/action-button/action-button';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Email: React.FC<{ email: string; setEmail: (email: string) => void; history?: any }> = ({
  email,
  setEmail,
  history
}) => {
  const [formValid, setFormValid] = useState(true);
  const emailRef = useRef<HTMLInputElement>(null);
  resizeFrame(293);
  const onEmailChange = (): void => {
    setFormValid(emailRef.current?.validity.valid || false);
  };
  const saveEmail = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    const newEmail = emailRef.current?.value as string;
    await set<string>('email', newEmail);
    setEmail(newEmail);
    history.goBack();
  };
  return (
    <div className="settings">
      <form onSubmit={saveEmail}>
        <div>
          <div className="settings-group">
            <div className="settings-group__label">Email</div>
            <div className="settings-group__input">
              <input
                type="email"
                defaultValue={email}
                placeholder="satoshi@bitpay.com"
                autoFocus
                required
                onChange={onEmailChange}
                ref={emailRef}
              />
            </div>
            <div className="settings-group__caption">Email used for purchase receipts and communication</div>
          </div>
        </div>
        <div className="action-button__footer--fixed">
          <ActionButton type="submit" disabled={!formValid}>
            Save
          </ActionButton>
        </div>
      </form>
    </div>
  );
};

export default Email;
