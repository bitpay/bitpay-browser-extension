import * as bitauthService from 'bitauth';
import { keyBy } from 'lodash';
import { sortByDescendingDate } from './gift-card';
import { GiftCard } from './gift-card.types';
import { get, set } from './storage';
import { post } from './utils';

export interface BitauthIdentity {
  created: number;
  priv: string;
  pub: string;
  sin: string;
}

export interface BitpayUser {
  eid?: string;
  email: string;
  familyName?: string;
  givenName?: string;
  syncGiftCards: boolean;
  token: string;
  incentiveLevel: string;
  incentiveLevelId: string;
}
export interface PairingData {
  code?: string;
  secret: string;
}

async function getIdentity(): Promise<BitauthIdentity> {
  const bitauthIdentity = (await get<BitauthIdentity>('bitauthIdentity')) || bitauthService.generateSin();
  await set<BitauthIdentity>('bitauthIdentity', bitauthIdentity);
  return bitauthIdentity;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiCall(token: string, method: string, params: any = {}): Promise<any> {
  const url = `${process.env.API_ORIGIN}/api/v2/`;
  const json = {
    method,
    params: JSON.stringify(params),
    token
  };
  const dataToSign = `${url}${token}${JSON.stringify(json)}`;
  const appIdentity = await getIdentity();
  const signedData = bitauthService.sign(dataToSign, appIdentity.priv);
  const headers = {
    'content-type': 'application/json',
    'x-identity': appIdentity.pub,
    'x-signature': signedData
  };
  const res = await post(`${url}${token}`, json, { headers });
  if (res && res.error) {
    throw new Error(res.error);
  }
  return res && res.data;
}

export async function syncGiftCards(user: BitpayUser): Promise<GiftCard[]> {
  const savedGiftCards = (await get<GiftCard[]>('purchasedGiftCards')) || [];
  const syncedGiftCards = savedGiftCards.filter(giftCard => giftCard.userEid === user.eid).sort(sortByDescendingDate);
  const latestSyncDate = syncedGiftCards[0]?.date;
  const olderThanThreeDays = (dateString: string): boolean => {
    const threeDaysAgo = Date.now() - 1000 * 60 * 60 * 24 * 3;
    return new Date(dateString).getTime() < threeDaysAgo;
  };
  const unsyncedGiftCardsResponse = await apiCall(user.token, 'findGiftCards', { dateStart: latestSyncDate });
  const unsyncedGiftCards = unsyncedGiftCardsResponse.map((resObj: any) => ({
    ...resObj,
    brand: undefined,
    createdOn: undefined,
    name: resObj.brand,
    date: resObj.createdOn,
    userEid: user.eid,
    archived: olderThanThreeDays(resObj.createdOn),
    totalDiscount: resObj.totalDiscount,
    status: 'SYNCED'
  })) as GiftCard[];
  if (!unsyncedGiftCards.length) {
    return savedGiftCards;
  }
  const giftCardMap = keyBy(savedGiftCards, giftCard => giftCard.invoiceId);
  const giftCards = unsyncedGiftCards.reduce(
    (newSavedGiftCards, unsyncedGiftCard) =>
      giftCardMap[unsyncedGiftCard.invoiceId] ? newSavedGiftCards : newSavedGiftCards.concat(unsyncedGiftCard),
    savedGiftCards as GiftCard[]
  );
  await set<GiftCard[]>('purchasedGiftCards', giftCards);
  return giftCards;
}

export async function refreshUserInfo(token: string): Promise<void> {
  const [userRes, previouslySavedUser] = await Promise.all([
    apiCall(token, 'getBasicInfo'),
    get<BitpayUser>('bitpayUser')
  ]);
  if (userRes) {
    if (userRes.error) {
      throw userRes.error;
    }
    const { eid, email, familyName, givenName, incentiveLevel, incentiveLevelId } = userRes;
    const user = {
      eid,
      email,
      familyName,
      givenName,
      token,
      syncGiftCards: previouslySavedUser ? previouslySavedUser.syncGiftCards : true,
      incentiveLevel,
      incentiveLevelId
    };
    await set<BitpayUser>('bitpayUser', user);
  }
}

export async function refreshUserInfoIfNeeded(forceRefresh = false): Promise<void> {
  const user = await get<BitpayUser>('bitpayUser');
  if (user && (!Object.prototype.hasOwnProperty.call(user, 'incentiveLevel') || forceRefresh)) {
    await refreshUserInfo(user.token);
  }
}

export async function generatePairingToken(payload: PairingData): Promise<void> {
  const { secret, code } = payload;
  const appIdentity = await getIdentity();
  const params = {
    ...(code && { code }),
    secret,
    version: 2,
    deviceName: 'Pay With BitPay Browser Extension'
  };
  const dataToSign = JSON.stringify(params);
  const signature = bitauthService.sign(dataToSign, appIdentity.priv);
  const finalParamsObject = {
    ...params,
    pubkey: appIdentity.pub,
    signature
  };
  const requestParams = {
    method: 'createToken',
    params: JSON.stringify(finalParamsObject)
  };
  const { data: token }: { data: string } = await post(`${process.env.API_ORIGIN}/api/v2/`, requestParams);
  await refreshUserInfo(token);
}
