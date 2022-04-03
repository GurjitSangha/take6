import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

import config from './firebase_config';
initializeApp(config);

export const firestore = getFirestore();
