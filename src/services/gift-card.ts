import {
  ApiCardConfig,
  AvailableCardMap,
  CardConfig,
  GiftCard,
  GiftCardActivationFee,
  ApiCard
} from './gift-card.types';

function getCardConfigFromApiBrandConfig(cardName: string, apiBrandConfig: ApiCardConfig): CardConfig {
  const cards = apiBrandConfig;
  const [firstCard] = cards;
  const { currency } = firstCard;
  const range = cards.find(c => !!(c.maxAmount || c.minAmount) && c.currency === currency) as ApiCard;
  const fixed = cards.filter(c => c.amount && c.currency);
  const supportedAmounts = fixed
    .reduce((newSupportedAmounts, currentCard) => {
      const curAmount = currentCard.amount as number;
      return [...newSupportedAmounts, curAmount];
    }, [] as number[])
    .sort((a: number, b: number) => a - b);

  const activationFees = cards
    .filter(c => c.activationFees)
    .reduce((allFees, card) => [...allFees, ...(card.activationFees || [])], [] as GiftCardActivationFee[]);

  const { amount, type, maxAmount, minAmount, ...config } = firstCard;
  const baseConfig = { ...config, name: cardName, activationFees };
  const rangeMin = range && (range.minAmount as number);
  return range
    ? {
        ...baseConfig,
        minAmount: rangeMin < 1 ? 1 : range.minAmount,
        maxAmount: range.maxAmount
      }
    : { ...baseConfig, supportedAmounts };
}

function getDisplayNameSortValue(displayName: string): string {
  const startsNumeric = (value: string): boolean => /^[0-9]$/.test(value.charAt(0));
  const name = displayName.toLowerCase();
  return `${startsNumeric(name) ? 'zzz' : ''}${name}`;
}
function sortByDisplayName(a: CardConfig | GiftCard, b: CardConfig | GiftCard): 1 | -1 {
  const aSortValue = getDisplayNameSortValue(a.displayName);
  const bSortValue = getDisplayNameSortValue(b.displayName);
  return aSortValue > bSortValue ? 1 : -1;
}

function fetchPublicAvailableCardMap(): Promise<AvailableCardMap> {
  const url = `https://bitpay.com/gift-cards/cards`;
  return fetch(url).then(res => res.json());
}

async function fetchAvailableCardMap(): Promise<AvailableCardMap> {
  const availableCardMap = await fetchPublicAvailableCardMap();
  return availableCardMap;
}

function removeDiscountsForNow(cardConfig: CardConfig, isCordova = false): CardConfig {
  return {
    ...cardConfig,
    discounts: isCordova ? cardConfig.discounts : undefined
  };
}

function getCardConfigFromApiConfigMap(availableCardMap: AvailableCardMap): CardConfig[] {
  const cardNames = Object.keys(availableCardMap);
  const availableCards = cardNames
    .filter(cardName => availableCardMap[cardName] && availableCardMap[cardName].length)
    .map(cardName => getCardConfigFromApiBrandConfig(cardName, availableCardMap[cardName]))
    .filter(config => !config.hidden)
    .map(cardConfig => removeDiscountsForNow(cardConfig))
    .map(cardConfig => ({
      ...cardConfig,
      displayName: cardConfig.displayName || cardConfig.name
    }))
    .sort(sortByDisplayName);
  return availableCards;
}

export function fetchAvailableCards(): Promise<CardConfig[]> {
  return fetchAvailableCardMap().then(availableCardMap => getCardConfigFromApiConfigMap(availableCardMap));
}
