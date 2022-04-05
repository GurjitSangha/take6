import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

import config from './firebase_config';
initializeApp(config);

const firestore = getFirestore();
connectFirestoreEmulator(firestore, 'localhost', 8080);
export { firestore };
