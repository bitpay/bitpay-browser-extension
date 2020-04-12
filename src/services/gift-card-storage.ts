import { GiftCard, Invoice } from './gift-card.types';
import { set } from './storage';
import { redeemGiftCard, getBitPayInvoice } from './gift-card';

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

const createEventSource = (url: string): Promise<Invoice> =>
  new Promise((resolve, reject) => {
    const source = new EventSource(url);
    source.addEventListener('statechange', async (event: Event) => {
      const { data } = event as CustomEvent;
      const updatedInvoice = JSON.parse(data);
      source.close();
      resolve(updatedInvoice);
    });
    source.addEventListener('paymentRejected', async () => {
      reject(new Error('paymentRejected'));
    });
    source.addEventListener('error', (e: Event) => {
      console.log('EventSource closed unexpectedly', e);
      reject(new Error());
    });
  });

export const waitForServerEvent = async (unredeemedGiftCard: GiftCard): Promise<Invoice> => {
  const {
    data: { url, token }
  } = await fetch(`${process.env.API_ORIGIN}/invoices/${unredeemedGiftCard.invoiceId}/events`).then(res => res.json());
  const busUrl = `${url}?token=${token}&action=subscribe&events[]=payment&events[]=confirmation&events[]=paymentRejected`;
  return createEventSource(busUrl);
};

export const listenForInvoiceChanges = async (unredeemedGiftCard: GiftCard): Promise<Invoice> => {
  const invoice = await getBitPayInvoice(unredeemedGiftCard.invoiceId);
  return invoice.status === 'new' ? waitForServerEvent(unredeemedGiftCard) : invoice;
};
