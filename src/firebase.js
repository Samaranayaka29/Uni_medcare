import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCg_FTnbldAOeOAEz7ljzo6nfIO3e7FCAI',
  authDomain: 'uni-med-care.firebaseapp.com',
  databaseURL: 'https://uni-med-care-default-rtdb.firebaseio.com',
  projectId: 'uni-med-care',
  storageBucket: 'uni-med-care.firebasestorage.app',
  messagingSenderId: '578944967403',
  appId: '1:578944967403:android:3bb9fd207c3fe1d83754ae',
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export default app
export { auth, db }
