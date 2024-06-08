import { Observable, Observer } from 'rxjs';
import { GiftCard, Invoice } from './gift-card.types';
import { set } from './storage';
import { redeemGiftCard, getBitPayInvoice } from './gift-card';
import { BitpayUser, apiCall } from './bitpay-id';

export interface CustomEvent extends Event {
  data: string;
}

export const updateCard = async (card: GiftCard, purchasedGiftCards: GiftCard[]): Promise<GiftCard[]> => {
  const newCards = purchasedGiftCards.map(purchasedCard =>
    purchasedCard.invoiceId === card.invoiceId ? { ...purchasedCard, ...card } : { ...purchasedCard }
  );
  await set<GiftCard[]>('purchasedGiftCards', newCards);
  return newCards;
};

export const deleteCard = async (card: GiftCard, purchasedGiftCards: GiftCard[]): Promise<GiftCard[]> => {
  const newCards = purchasedGiftCards.filter(purchasedCard => purchasedCard.invoiceId !== card.invoiceId);
  await set<GiftCard[]>('purchasedGiftCards', newCards);
  return newCards;
};

export const handlePaymentEvent = async (
  unredeemedGiftCard: GiftCard,
  invoice: Invoice,
  purchasedGiftCards: GiftCard[]
): Promise<GiftCard[]> => {
  if (invoice.status === 'expired' || invoice.status === 'invalid') {
    return deleteCard(unredeemedGiftCard, purchasedGiftCards);
  }
  if (invoice.status === 'paid') {
    return updateCard({ ...unredeemedGiftCard, status: 'PENDING', invoice }, purchasedGiftCards);
  }
  if (['confirmed', 'complete'].includes(invoice.status)) {
    return updateCard(await redeemGiftCard(unredeemedGiftCard), purchasedGiftCards);
  }
  return purchasedGiftCards;
};

const getBusUrl = async ({ invoiceId, user }: { invoiceId: string; user?: BitpayUser }): Promise<string> => {
  const {
    data: { url, token }
  } =
    user && user.syncGiftCards
      ? { data: await apiCall(user.token, 'getInvoiceBusToken', { invoiceId }) }
      : await fetch(`${process.env.API_ORIGIN}/invoices/${invoiceId}/events`).then(res => res.json());
  return `${url}?token=${token}&action=subscribe&events[]=payment&events[]=confirmation&events[]=paymentRejected`;
};

export const createEventSourceObservable = async ({
  invoiceId,
  user
}: {
  invoiceId: string;
  user?: BitpayUser;
}): Promise<Observable<Invoice>> => {
  const busUrl = await getBusUrl({ invoiceId, user });
  return Observable.create((observer: Observer<Invoice>) => {
    const source = new EventSource(busUrl);
    source.addEventListener('statechange', (event: Event) => {
      const { data } = event as CustomEvent;
      const updatedInvoice = JSON.parse(data);
      observer.next(updatedInvoice);
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    source.addEventListener('error', (event: any) => observer.error(event));
    return (): void => {
      source.close();
    };
  });
};

const createEventSource = (url: string): Promise<Invoice> =>
  new Promise((resolve, reject) => {
    const source = new EventSource(url);
    source.addEventListener('statechange', (event: Event) => {
      const { data } = event as CustomEvent;
      const updatedInvoice = JSON.parse(data);
      source.close();
      resolve(updatedInvoice);
    });
    source.addEventListener('paymentRejected', () => {
      reject(new Error('paymentRejected'));
    });
    source.addEventListener('error', (e: Event) => {
      console.log('EventSource closed unexpectedly', e);
      reject(new Error());
    });
  });

export const waitForServerEvent = async ({
  user,
  unredeemedGiftCard
}: {
  user?: BitpayUser;
  unredeemedGiftCard: GiftCard;
}): Promise<Invoice> => {
  const busUrl = await getBusUrl({ invoiceId: unredeemedGiftCard.invoiceId, user });
  return createEventSource(busUrl);
};

export const listenForInvoiceChanges = async ({
  unredeemedGiftCard,
  user
}: {
  unredeemedGiftCard: GiftCard;
  user?: BitpayUser;
}): Promise<Invoice> => {
  const invoice = await getBitPayInvoice(unredeemedGiftCard.invoiceId);
  return invoice.status === 'new' ? waitForServerEvent({ unredeemedGiftCard, user }) : invoice;
};
