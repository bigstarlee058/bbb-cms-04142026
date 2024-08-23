import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, getDownloadURL, updateMetadata } from 'firebase/storage';
import { FirebaseError } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBZr5BnHeA-4eLzEacmHC4M-tKnpXCA-T4",
  authDomain: "bbb-app-d4b41.firebaseapp.com",
  projectId: "bbb-app-d4b41",
  storageBucket: "bbb-app-d4b41.appspot.com",
  messagingSenderId: "693919444814",
  appId: "1:693919444814:web:fa9035568f3e1067f8f81f",
  measurementId: "G-Q6ZCD3369N"
};

export const firebaseapp = initializeApp(firebaseConfig);
export const storage = getStorage();
export const auth = getAuth();
export const db_firestore = getFirestore();

export const firebaseErrorString = (error: FirebaseError) => {
  const res = { message: '' };
  res.message = error.message;
  const errorCode = error.code;
  if (errorCode === 'auth/too-many-requests') {
    res.message = 'Too many requests. Try again later.';
  } else if (errorCode === 'auth/invalid-credential') {
    res.message = 'Invalid credentials.';
  } else if (errorCode == 'auth/weak-password') {
    res.message = 'The password is too weak. Try another password.';
  } else if (errorCode == 'auth/email-already-in-use') {
    res.message = 'Duplicated email.';
  } else if (errorCode == 'auth/invalid-email') {
    res.message = 'Invalid email.';
  } else if (errorCode == 'auth/user-not-found') {
    res.message = 'User not found.';
  }
  return res;
};

export const getFirebaseImage = async (location: string) => {
  try {
    const ImageRef = ref(storage, location);
    await updateMetadata(ImageRef, {
      customMetadata: {
        cacheControl: 'public, max-age=300',
      },
    });
    const ImageURL = await getDownloadURL(ImageRef);
    return await ImageURL;
  } catch (e) {
    console.log(e);
    return '';
  }
}

export const getToken = async () => {
  if (auth && auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    return token;
  }
  return undefined;
}
