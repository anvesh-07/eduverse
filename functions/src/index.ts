import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

/**
 * Triggered when a new user is created in Firebase Authentication.
 * Creates a corresponding user document in Firestore.
 */
export const createUserDocument = functions.auth.user().onCreate((user) => {
  const { uid, email, displayName } = user;
  const db = admin.firestore();

  const userDocRef = db.collection("users").doc(uid);

  return userDocRef.set({
    email,
    displayName: displayName || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    followedTopics: [],
  });
});
