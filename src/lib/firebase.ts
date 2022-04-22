import { initializeApp } from 'firebase/app';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import config from './firebase_config';

initializeApp(config);

const firestore = getFirestore();
if (import.meta.env.DEV) {
	connectFirestoreEmulator(firestore, 'localhost', 8080);
}
export { firestore };
