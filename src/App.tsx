import { Routes, Route } from 'react-router-dom';
import CalendarBoard from './components/calendar/CalendarBoard';
import Login from './pages/Login';
import PrivateRoute from './routes/PrivateRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <CalendarBoard />
          </PrivateRoute>
        }
      />
      {/* fallback */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
}
