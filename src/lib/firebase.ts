import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import config from "../../firebase-applet-config.json";

const app = initializeApp(config);
export { app };
export const auth = getAuth(app);
export const db = getFirestore(app, config.firestoreDatabaseId);
