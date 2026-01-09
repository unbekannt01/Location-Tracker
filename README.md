# Family Location Tracker 📍

A **React Native + Expo** application for tracking family member locations in real-time using **Firebase Realtime Database**.  
Built with **Admin & Member roles**, background location tracking, and live map updates.

---

## ✨ Features

- 👥 **Dual Role System** (Admin & Member)
- 👨‍👩‍👧 **Group / Family Management**
- 📍 **Real-time Location Tracking**
- 🔄 **Background Location Updates**
- 🗺️ **OpenStreetMap Integration**
- 🔐 **Basic Authentication Logic**
- 📊 **Admin Dashboard**
- 💾 **Offline-ready local storage (AsyncStorage)**

---

## 🛠 Tech Stack

- **React Native + Expo**
- **Firebase Realtime Database**
- **Firebase Authentication (Anonymous)**
- **Expo Location**
- **OpenStreetMap**
- **AsyncStorage**

---

## 📂 Project Structure

```
├── App.js
├── firebase.js
├── app.json
├── package.json
├── .env.example
├── src/
│   ├── LoginScreen.js
│   ├── HomeScreen.js
│   ├── MapScreenOSM.js
│   ├── backgroundLocationTask.js
│   └── screens/
│       ├── CreateGroupScreen.js
│       ├── GroupsListScreen.js
│       ├── MembersListScreen.js
│       ├── AddMemberScreen.js
│       ├── AdminLocationTrackingScreen.js
│       └── ChangePasswordScreen.js
```

---

## 🚀 Setup Instructions

### 1️⃣ Prerequisites

- Node.js **v16+**
- Expo CLI  
  ```bash
  npm install -g expo-cli
  ```
- Firebase account

---

### 2️⃣ Install Dependencies

```bash
npm install
# or
yarn install
```

---

### 3️⃣ Firebase Configuration

1. Create a Firebase project
2. Enable **Realtime Database**
3. Enable **Authentication → Anonymous**
4. Copy `.env.example` → `.env`

```bash
cp .env.example .env
```

Fill `.env`:
```
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_DATABASE_URL=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
```

📌 **Important**: Never commit `.env` to GitHub

---

### 4️⃣ Run App

```bash
expo start
```

- Press **a** → Android
- Press **i** → iOS
- Or scan QR with Expo Go

---

## 🔐 Default Login

```
Username: admin
Password: admin
```

⚠️ Change immediately after first login.

---

## 👤 User Roles

### Admin
- Create groups
- Add/remove members
- Track all member locations
- Change member passwords

### Member
- Share live location
- View group map
- Change own password

---

## 📍 Location Permissions

Required:
- Foreground Location
- Background Location

⚠️ Disable battery optimization for best performance

---

## ⚠️ Security Notes

- Passwords stored as **plain text**
- For production:
  - Use Firebase Auth (Email/OTP)
  - Hash passwords
  - Restrict Firebase Rules

---

## 🧭 Firebase Data Structure

```
users/
groups/
locations/
emailVerification/
```

(Full structure explained in `FIREBASE_SETUP.md`)

---

## 🔮 Future Enhancements

- 🔔 Location alerts
- 🛑 Geofencing
- 📊 History & analytics
- 🔐 Two-factor auth
- 👁 Privacy controls

---

## ❤️ Support

Raise an issue or ask anytime.
