
import { collection, addDoc, Firestore } from 'firebase/firestore';
import type { Order } from '@/lib/types';

/**
 * Saves an order to the user's subcollection in Firestore.
 * This is intended to be called from a client component after payment verification.
 * @param firestore The Firestore instance (passed from client).
 * @param userId The ID of the user placing the order.
 * @param orderData The order data to save.
 */
export async function saveOrder(firestore: Firestore, userId: string, orderData: Omit<Order, 'id'>): Promise<string> {
  try {
    const ordersCollection = collection(firestore, 'users', userId, 'orders');
    const docRef = await addDoc(ordersCollection, orderData);
    return docRef.id;
  } catch (error) {
    console.error('Error saving order:', error);
    // In a real app, you'd want more robust error handling, maybe re-throwing a custom error.
    throw new Error('Could not save order to Firestore.');
  }
}
