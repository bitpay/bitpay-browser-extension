/* eslint-disable jsx-a11y/no-autofocus */
import React, { useRef, useEffect, Dispatch, SetStateAction, useState } from 'react';
import { RouteComponentProps, Link } from 'react-router-dom';
import MaskedInput from 'react-text-mask';
import { useTracking } from 'react-tracking';
import { resizeToFitPage } from '../../../services/frame';
import { trackComponent } from '../../../services/analytics';
import ActionButton from '../../components/action-button/action-button';
import { IOSSwitch } from '../../components/ios-switch/ios-switch';
import {
  getPhoneCountryCodes,
  getPhoneMask,
  getSavedPhoneCountryCode,
  PhoneCountryCode
} from '../../../services/phone';
import { PhoneCountryInfo, CardConfig, GiftCardInvoiceParams } from '../../../services/gift-card.types';
import { set } from '../../../services/storage';

const getPlaceholder = (phoneCountryCode: string): string =>
  phoneCountryCode === '1' ? '(610) 245-1933' : '6102451933';

const getMinLength = (phoneCountryCode: string): number => (phoneCountryCode === '1' ? 14 : 1);

const Phone: React.FC<RouteComponentProps & {
  country: string;
  phone: string;
  phoneCountryInfo: PhoneCountryInfo;
  setPhoneCountryInfo: Dispatch<SetStateAction<PhoneCountryInfo>>;
  setPhone: Dispatch<SetStateAction<string>>;
}> = ({ country, phone, phoneCountryInfo, setPhone, setPhoneCountryInfo, location, history }) => {
  const tracking = useTracking();
  const { amount, cardConfig, invoiceParams } = location.state as {
    amount: string;
    cardConfig: CardConfig;
    invoiceParams: GiftCardInvoiceParams;
  };
  const savedPhoneCountry =
    phoneCountryInfo && getSavedPhoneCountryCode(phoneCountryInfo.phoneCountryCode, phoneCountryInfo.countryIsoCode);
  const validSavedPhone =
    savedPhoneCountry &&
    (!cardConfig.allowedPhoneCountries || cardConfig.allowedPhoneCountries.includes(savedPhoneCountry.countryCode));

  const firstAllowedPhoneCountry = getPhoneCountryCodes().find(
    countryCode => countryCode.countryCode === (cardConfig?.allowedPhoneCountries || [])[0]
  ) as PhoneCountryCode;
  const userPhoneCountry =
    getPhoneCountryCodes().find(countryCode => countryCode.countryCode === country) ||
    (getPhoneCountryCodes().find(countryCode => countryCode.countryCode === 'US') as PhoneCountryCode);
  const isUserPhoneCountryAllowed = cardConfig.allowedPhoneCountries
    ? cardConfig.allowedPhoneCountries.includes(country)
    : true;

  const purchasePhoneCountryInfo: PhoneCountryInfo = validSavedPhone
    ? phoneCountryInfo
    : {
        phoneCountryCode: isUserPhoneCountryAllowed ? userPhoneCountry.phone : firstAllowedPhoneCountry.phone,
        countryIsoCode: isUserPhoneCountryAllowed ? userPhoneCountry.countryCode : firstAllowedPhoneCountry.countryCode
      };

  const savedPhoneWithoutCountryCode = validSavedPhone ? phone : '';

  const phoneMask = getPhoneMask(purchasePhoneCountryInfo.phoneCountryCode);

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    resizeToFitPage(ref, 185);
  }, [ref]);
  const [formValid, setFormValid] = useState(false);
  const phoneRef = useRef<MaskedInput>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const onePhoneCountry = (cardConfig.allowedPhoneCountries || []).length === 1;
  const getInputValue = (): string => (phoneRef.current?.inputElement as HTMLInputElement).value;
  const isPhoneValid = (): boolean => getInputValue().length >= getMinLength(purchasePhoneCountryInfo.phoneCountryCode);
  const onInputChange = (): void => {
    setFormValid(isPhoneValid() && permissionGranted);
  };
  const handleSwitchChange = (): void => {
    setPermissionGranted(!permissionGranted);
    setFormValid(isPhoneValid() && !permissionGranted);
  };
  const enableContactless = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const inputValue = getInputValue().replace(/\D/g, '');
    const fullPhone = `${purchasePhoneCountryInfo.phoneCountryCode}${inputValue}`;
    await set<string>('phone', fullPhone);
    await set<PhoneCountryInfo>('phoneCountryInfo', purchasePhoneCountryInfo);
    setPhone(inputValue);
    setPhoneCountryInfo(purchasePhoneCountryInfo);
    history.push({
      pathname: `/payment/${cardConfig.name}`,
      state: {
        amount,
        cardConfig,
        invoiceParams: { ...invoiceParams, phone: fullPhone }
      }
    });
    tracking.trackEvent({
      action: 'enabledContactless',
      merchant: cardConfig.name,
      gaAction: `enabledContactless:${cardConfig.name}`
    });
  };
  return (
    <div className="settings account">
      <div ref={ref}>
        <form onSubmit={enableContactless}>
          <div className="account__zero-state">
            <div className="account__title">Enable Contactless?</div>
            <div className="account__body" style={{ marginBottom: 0 }}>
              Add a phone number to connect this card to Apple Pay or Google Pay.
            </div>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div className="settings-group">
              <div className="settings-group__label">Phone Number</div>
              <div className="settings-group__input">
                <Link
                  to={{ pathname: '/country', state: { allowedPhoneCountries: cardConfig.allowedPhoneCountries } }}
                  style={{ pointerEvents: onePhoneCountry ? 'none' : 'all' }}
                >
                  <div className="settings-group__input__country">
                    <img
                      className="settings-group__input__flag"
                      src={`https://bitpay.com/img/flags-round/${purchasePhoneCountryInfo.countryIsoCode.toLowerCase()}.svg`}
                      alt={purchasePhoneCountryInfo.countryIsoCode}
                    />
                    <div className="settings-group__input__country-code">
                      +{purchasePhoneCountryInfo.phoneCountryCode}
                    </div>
                  </div>
                </Link>
                <MaskedInput
                  type="tel"
                  defaultValue={savedPhoneWithoutCountryCode}
                  placeholder={getPlaceholder(purchasePhoneCountryInfo.phoneCountryCode)}
                  autoFocus
                  onChange={onInputChange}
                  required
                  guide={false}
                  mask={phoneMask}
                  ref={phoneRef}
                />
              </div>
              {onePhoneCountry && cardConfig && (
                <div className="settings-group__caption">
                  Only a {firstAllowedPhoneCountry?.name} phone number can be used
                </div>
              )}
            </div>
          </div>
          <div className="settings-group__item settings-group__item--consent">
            <div className="settings-group__item__label--small">
              By giving my phone number, I give explicit consent to BitPay to use it to connect this card to Apple Pay
              or Google Pay.
            </div>
            <div className="settings-group__item__value">
              <IOSSwitch checked={permissionGranted} onChange={handleSwitchChange} name="permission" />
            </div>
          </div>
          <div className="action-button__footer--fixed">
            <ActionButton type="submit" disabled={!formValid}>
              Enable Contactless
            </ActionButton>
            <Link
              to={{
                pathname: `/payment/${cardConfig.name}`,
                state: {
                  amount,
                  cardConfig,
                  invoiceParams
                }
              }}
              onClick={(): void => {
                tracking.trackEvent({
                  action: 'skippedContactless',
                  merchant: cardConfig.name,
                  gaAction: `skippedContactless:${cardConfig.name}`
                });
              }}
            >
              <div className="secondary-button">Skip</div>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default trackComponent(Phone, { page: 'phone' });
