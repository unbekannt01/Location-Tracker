import { initializeApp } from "firebase/app"
import { getDatabase } from "firebase/database"
import { getStorage } from "firebase/storage"
import { initializeAuth, getReactNativePersistence } from "firebase/auth"
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage"

let firebaseApp = null
let auth = null
let db = null
let storage = null

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

const hasValidConfig = Object.values(firebaseConfig).every(
  (value) => value && typeof value === "string" && value.trim() !== "",
)

if (hasValidConfig) {
  try {
    firebaseApp = initializeApp(firebaseConfig)

    // Initialize Auth with AsyncStorage persistence
    auth = initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    })

    // Initialize Realtime Database
    db = getDatabase(firebaseApp)

    // Initialize Firebase Storage for camera captures
    storage = getStorage(firebaseApp)

    console.log("[Firebase] Initialized successfully with Storage")
  } catch (error) {
    console.error("[Firebase] Initialization failed:", error.message)
  }
} else {
  console.error(
    "[Firebase] Invalid Firebase config - missing required environment variables. Please add them to your .env file.",
  )
}

export { firebaseApp, auth, db, storage }