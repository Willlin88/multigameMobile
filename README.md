# Game Hub - React Native App

## 📌 Overview
Game Hub is a React Native application built with Expo that allows users to enter their username before accessing different game modes. The app features a dynamic UI with parallax scrolling, themed components, and smooth navigation.

## 🚀 Features
- **Gamer tag Entry**: Users must enter a gamer tag before accessing games.
- **Dynamic Greeting**: Displays "Hello, <gamer tag>!" after submission.
- **Game Selection**: Only available after gamer tag submission.
- **Logout Option**: Clears gamer tag and returns to the home screen.
- **Smooth UI**: Implemented using Expo Router, React Native components, and a Parallax Scroll View.

## 📂 Project Structure
```
/game-hub-app
├── assets/                 # Images and icons
├── components/            # UI components (HelloWave, ThemedText, ThemedView, etc.)
├── screens/               # Screens (HomeScreen, GameScreens)
├── constants/             # Color themes and constants
├── hooks/                 # Custom hooks
├── app/                   # Entry point
└── README.md              # Documentation
```

## 🛠️ Installation
### 1️⃣ Clone the Repository
```sh
git clone https://github.com/your-repo/game-hub.git
cd game-hub
```
### 2️⃣ Install Dependencies
```sh
npm install  # or yarn install
```
### 3️⃣ Start the App
```sh
Go into the my-app folder
Then npm run android # or npm run ios # or npm run web
```

## 📌 Usage
1. Open the app.
2. Enter a username and click **Submit**.
3. Select a game from the available options.
4. Click **Logout** to return to the home screen.

## 🔄 Navigation
- Uses **Expo Router** for managing screens.
- The bottom tab bar dynamically hides games if the user hasn’t entered a username.

## 📱 Tech Stack
- **React Native** (UI development)
- **Expo** (Fast development)
- **Expo Router** (Navigation)
- **React Hooks** (State management)

## 👨‍💻 Contributions
Feel free to fork this repo and submit PRs for enhancements.

