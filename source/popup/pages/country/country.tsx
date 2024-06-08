import React, { Dispatch, SetStateAction, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useTracking } from 'react-tracking';
import { trackComponent } from '../../../services/analytics';
import { PhoneCountryInfo } from '../../../services/gift-card.types';
import { getPhoneCountryCodes } from '../../../services/phone';
import SearchBar from '../../components/search-bar/search-bar';
import './country.scss';

const Country: React.FC<RouteComponentProps & {
  setPhoneCountryInfo: Dispatch<SetStateAction<PhoneCountryInfo>>;
}> = ({ setPhoneCountryInfo, history, location }) => {
  const { allowedPhoneCountries } = location.state as { allowedPhoneCountries: string[] };
  const tracking = useTracking();
  const phoneCountryCodes = getPhoneCountryCodes();
  const [searchVal, setSearchVal] = useState('' as string);
  const selectPhoneCountryInfo = (newPhoneCountryInfo: PhoneCountryInfo): void => {
    setPhoneCountryInfo(newPhoneCountryInfo);
    history.goBack();
  };
  return (
    <div className="settings country">
      <SearchBar autoFocus output={setSearchVal} value={searchVal} placeholder="Search countries" tracking={tracking} />
      <div className="settings-group">
        {phoneCountryCodes
          .filter(phoneCountryCode => phoneCountryCode.name.toLowerCase().includes(searchVal.toLowerCase()))
          .filter(phoneCountryCode =>
            allowedPhoneCountries ? allowedPhoneCountries.includes(phoneCountryCode.countryCode) : true
          )
          .map((phoneCountryCode, index) => (
            <button
              key={index}
              type="button"
              className="settings-group__item settings-group__item--dark no-arrow"
              onClick={(): void =>
                selectPhoneCountryInfo({
                  phoneCountryCode: phoneCountryCode.phone,
                  countryIsoCode: phoneCountryCode.countryCode
                })
              }
            >
              <img
                className="settings-group__input__flag"
                src={`https://bitpay.com/img/flags-round/${phoneCountryCode.countryCode.toLowerCase()}.svg`}
                alt="US"
              />
              <div className="settings-group__item__label">{phoneCountryCode.name}</div>
              <div className="settings-group__item__value">+{phoneCountryCode.phone}</div>
            </button>
          ))}
      </div>
    </div>
  );
};

export default trackComponent(Country, { page: 'country' });
