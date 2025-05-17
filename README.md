# TeamBoard Frontend

A calendar-based web application for managing training, matches, and tactical events in an amateur football club. This is the React + Tailwind frontend of the TeamBoard system.

## 🌐 Live Demo

> [Insert Vercel link here once deployed]

---

## ⚙️ Technologies Used

- React 18+
- TypeScript
- Tailwind CSS
- Axios
- React Calendar
- React Router Dom
- Vite

---

## 🔐 Features

- Login with JWT authentication
- Role-based access control (`manager` or `player`)
- Monthly calendar interface
- Create, edit, and delete events via modal
- Conditional UI based on user role
- Fully responsive layout

---

## 📦 Getting Started Locally

1. Clone the repository:

```bash
git clone https://github.com/your-username/teamboard-frontend.git
cd teamboard-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file:

```env
VITE_API_URL=http://localhost:3333
```

4. Start the development server:

```bash
npm run dev
```

---

## 🖼️ Folder Structure

```
src/
├── components/
│   └── Calendar/
│       ├── CalendarBoard.tsx
│       └── CreateEventModal.tsx
├── contexts/
│   └── AuthContext.tsx
├── pages/
│   └── Login.tsx
├── services/
│   └── api.ts
├── App.tsx
└── main.tsx
```


## 🧠 Author

**Nicolas Lima**  
[LinkedIn Profile](https://www.linkedin.com/in/nicolaslimadeveloper/)  

---

## 📄 License

This project is licensed under the MIT License."# TeamBoard-Frontend" 
