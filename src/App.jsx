import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Confirm from './pages/Confirm';
import Profile from './pages/Profile';
import Competitions from './pages/Competitions';
import MatchPreferences from './pages/MatchPreferences';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/confirm" element={<Confirm />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/competitions" element={<Competitions />} />
        <Route path="/match/:contestId" element={<MatchPreferences />} />
        
        {/* 之後可加入 /profile, /competitions 等頁面 */}
      </Routes>
    </Router>
  );
}

export default App;

