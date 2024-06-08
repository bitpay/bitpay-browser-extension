import { countries } from 'countries-list';

export interface PhoneCountryCode {
  emoji: string;
  phone: string;
  name: string;
  countryCode: string;
}

export function getPhoneCountryCodes(allowedPhoneCountries?: string[]): PhoneCountryCode[] {
  const countryCodes = Object.keys(countries);
  const countryList = Object.values(countries);
  const countryListWithCodes = countryList
    .map((country, index) => ({
      ...country,
      countryCode: countryCodes[index]
    }))
    .filter(country => (allowedPhoneCountries ? allowedPhoneCountries.includes(country.countryCode) : true));
  const countriesWithMultiplePhoneCodes = countryListWithCodes
    .filter(country => country.phone.includes(','))
    .map(country => {
      const codes = country.phone.split(',');
      return codes.map(code => ({ ...country, phone: code }));
    });
  const countriesWithSinglePhoneCode = countryListWithCodes.filter(country => !country.phone.includes(','));
  const multiplePhoneCodesFlattened = countriesWithMultiplePhoneCodes.flat();
  return countriesWithSinglePhoneCode
    .concat(multiplePhoneCodesFlattened)
    .sort((a, b) => (a.name < b.name ? -1 : 1))
    .filter(country => country.name !== 'Antarctica');
}

export function getPhoneMask(phoneCountryCode: string): string[] {
  const usMask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  return phoneCountryCode === '1' ? usMask : Array(15).fill(/\d/);
}

export function getSavedPhoneCountryCode(phoneCountryCode: string, countryIsoCode: string): PhoneCountryCode {
  const countryCodes = getPhoneCountryCodes();
  return countryCodes.find(
    countryCodeObj => countryCodeObj.phone === phoneCountryCode && countryIsoCode === countryCodeObj.countryCode
  ) as PhoneCountryCode;
}
