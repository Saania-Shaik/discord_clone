import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { useAuth } from './context/AuthContext';

function App() {
  const { token, loading } = useAuth();

  if (loading) return <div className="h-screen w-full bg-gray-900 flex items-center justify-center text-white">Loading...</div>;

  return (
    <Router>
      <div className="h-screen w-full bg-gray-900 text-white flex overflow-hidden font-sans">
        <Routes>
          <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!token ? <Register /> : <Navigate to="/" />} />
          <Route path="/*" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
