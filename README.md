
# ♟️ Multiplayer Chess Game

A **real-time multiplayer chess game** built using **React, Firebase, and Chess.js**. Players can **create a room, share a 4-digit code, and play against each other online** with real-time move synchronization.

---

## 🚀 Features

✅ **Create & Join Game Rooms** (4-digit code)  
✅ **Real-Time Chess Moves** (Synced via Firebase)  
✅ **Turn-Based Play Enforcement**  
✅ **Checkmate & Draw Detection**  
✅ **Responsive Chessboard**  
✅ **Secure API Keys Handling** (via `.env`)  

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS  
- **Backend:** Firebase Realtime Database  
- **Game Logic:** Chess.js  
- **Chessboard UI:** React-Chessboard  

---

## 🔧 Installation & Setup

### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/Gaurav-Ghildiyal/chess-multiplayer.git
cd chess-multiplayer
```

### **2️⃣ Install Dependencies**
```sh
npm install
```

### **3️⃣ Set Up Firebase Environment Variables**
1. **Create a `.env.local` file** in the root directory.  
2. Add the following Firebase keys (**replace with your actual values**):

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_DATABASE_URL=your-database-url
```

3. **Make sure `.env.local` is added to `.gitignore`** to keep your keys secure.

---

## 🎮 How to Play

1️⃣ **Create a Room**  
- Click **"Create Room"** to generate a 4-digit game code.  
- Share this code with your opponent.  

2️⃣ **Join a Room**  
- Enter a 4-digit code received from the opponent.  

3️⃣ **Start Playing**  
- The game enforces **turn-based play**.  
- Moves are **synced in real-time**.  
- **Checkmate detection** will determine the winner.

---

## 🖥️ Running the Project Locally
```sh
npm run dev
```
Then, open **`http://localhost:5173`** in your browser.

---

## 🚀 Deploying on Vercel

### **1️⃣ Connect Your GitHub Repo to Vercel**
- Go to [Vercel](https://vercel.com/)  
- Import your GitHub repository  
- Click **"Deploy"**  

### **2️⃣ Add Environment Variables**
In **Vercel Dashboard → Settings → Environment Variables**, add:

| Key | Value |
|------|--------------------------|
| `VITE_FIREBASE_API_KEY` | your-api-key |
| `VITE_FIREBASE_AUTH_DOMAIN` | your-auth-domain |
| `VITE_FIREBASE_PROJECT_ID` | your-project-id |
| `VITE_FIREBASE_STORAGE_BUCKET` | your-storage-bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | your-messaging-sender-id |
| `VITE_FIREBASE_APP_ID` | your-app-id |
| `VITE_FIREBASE_DATABASE_URL` | your-database-url |

Then, **redeploy the project**.

---

## 📝 To-Do (Future Enhancements)


- 🔹 **Fix UI** 
- 🔹 **Add audio support to move the pieces** 
- 🔹 **Add a Chat Feature**  
- 🔹 **Show Move History (PGN Format)**  
- 🔹 **Timers for Each Player**  
- 🔹 **AI Opponent Mode**  
- 🔹 **Leaderboard & Player Stats**  
- 🔹 **Login support** 

---

## 📜 License

This project is open-source and available under the **MIT License**.

---

## 🎯 Contributing

If you want to contribute:
1. **Fork the repo**  
2. **Create a new branch:** `git checkout -b feature-name`  
3. **Make your changes**  
4. **Commit & push:** `git commit -m "Added feature X"`  
5. **Open a Pull Request**  

---

## 📩 Contact

🔹 **Developer:** Gaurav Ghildiyal  
🔹 **GitHub:** [@Gaurav-Ghildiyal](https://github.com/Gaurav-Ghildiyal)  
🔹 **Email:** `gghildiyal299@gmail.com`

---

### **🌟 If you like this project, give it a star on GitHub!** ⭐

