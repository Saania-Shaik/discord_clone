# 💬 Discord Clone

A full-stack real-time chat application inspired by Discord, built with the **MERN stack** and **Socket.IO**.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

---

## ✨ Features

### Authentication & Users
- User registration and login with **JWT**-based authentication
- Password hashing with **bcrypt**
- Customizable user profiles (display name, pronouns, bio, avatar)

### Servers & Channels
- Create and join servers
- Role-based access control — **Owner**, **Admin**, and **Member** roles
- Admin-only channel creation within servers
- Text channels with real-time messaging

### Real-Time Messaging
- Instant messaging powered by **Socket.IO**
- Direct messages (DMs) between users
- Multi-image sharing support via file uploads
- Online/offline presence tracking across all users

### User Profiles & Social
- View other users' profiles via click-to-open modal
- Private notes on other users (visible only to you)
- Real-time member list with online status indicators

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 19, Vite, Tailwind CSS 4      |
| Backend    | Node.js, Express 5                  |
| Database   | MongoDB with Mongoose               |
| Real-Time  | Socket.IO                           |
| Auth       | JWT, bcrypt                         |
| File Upload| Multer                              |
| HTTP Client| Axios                               |
| Icons      | Lucide React                        |
| Routing    | React Router DOM v7                 |

---

## 📁 Project Structure

```
discord-clone/
├── backend/
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT authentication middleware
│   ├── models/
│   │   ├── Channel.js             # Channel schema (text, voice, DM)
│   │   ├── Message.js             # Message schema with image support
│   │   ├── Note.js                # Private user notes
│   │   ├── Server.js              # Server schema with roles
│   │   └── User.js                # User schema with profile fields
│   ├── routes/
│   │   ├── auth.js                # Register / Login
│   │   ├── channel.js             # Channel CRUD
│   │   ├── message.js             # Messaging + file upload
│   │   ├── server.js              # Server CRUD + member management
│   │   └── user.js                # Profile & notes
│   ├── server.js                  # Express + Socket.IO entry point
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── ChannelBar.jsx     # Channel sidebar
│   │   │   │   ├── ChatArea.jsx       # Main chat interface
│   │   │   │   ├── MemberList.jsx     # Server member list
│   │   │   │   └── Sidebar.jsx        # Server list sidebar
│   │   │   ├── profile/
│   │   │   │   ├── ProfileDisplay.jsx # View profile details
│   │   │   │   └── ProfileEdit.jsx    # Edit own profile
│   │   │   └── UserProfileModal.jsx   # User profile popup
│   │   ├── context/
│   │   │   ├── AuthContext.jsx        # Auth state management
│   │   │   └── SocketContext.jsx      # Socket.IO connection
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx          # Main app layout
│   │   │   ├── Login.jsx              # Login page
│   │   │   └── Register.jsx           # Registration page
│   │   ├── App.jsx                    # Routes & auth guards
│   │   ├── main.jsx                   # React entry point
│   │   └── index.css                  # Global styles
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone the repository

```bash
git clone https://github.com/Saania-Shaik/discord_clone.git
cd discord_clone
```

### 2. Setup the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
MONGO_URI=mongodb://127.0.0.1:27017/discord-clone
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

Start the backend server:

```bash
node server.js
```

### 3. Setup the Frontend

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend dev server:

```bash
npm run dev
```

### 4. Open the app

Visit **http://localhost:5173** in your browser.

---

## 📡 API Endpoints

### Auth
| Method | Endpoint            | Description          |
|--------|---------------------|----------------------|
| POST   | `/api/auth/register`| Register a new user  |
| POST   | `/api/auth/login`   | Login and get JWT    |

### Servers
| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| POST   | `/api/servers`                  | Create a server          |
| GET    | `/api/servers`                  | Get user's servers       |
| POST   | `/api/servers/:id/join`         | Join a server            |

### Channels
| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| POST   | `/api/channels`                 | Create a channel         |
| GET    | `/api/channels/:serverId`       | Get server channels      |

### Messages
| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| POST   | `/api/messages`                 | Send a message           |
| GET    | `/api/messages/:channelId`      | Get channel messages     |

### Users
| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| GET    | `/api/users/profile`            | Get own profile          |
| PUT    | `/api/users/profile`            | Update profile           |
| GET    | `/api/users/:id`                | Get another user's profile|

---

## 🔌 Socket.IO Events

| Event              | Direction       | Description                        |
|--------------------|-----------------|------------------------------------|
| `setup`            | Client → Server | Register user and join personal room |
| `join_channel`     | Client → Server | Join a channel room                |
| `send_message`     | Client → Server | Send a message to a channel        |
| `receive_message`  | Server → Client | Receive a new message              |
| `online_users_update` | Server → Client | Broadcast online user list       |

---

## 👥 Role-Based Access

| Role         | Permissions                                    |
|--------------|------------------------------------------------|
| **Owner**    | Full control — manage server, roles, channels  |
| **Admin**    | Create/delete channels, manage members         |
| **Member**   | Send messages, view channels                   |

---

## 📄 License

This project is for educational purposes.
