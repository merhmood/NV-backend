import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT env variable is missing");
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// Replace escaped \n with real newlines
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

export default db;
