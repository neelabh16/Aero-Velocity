import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth/Auth';
import Predict from './pages/Predict';
import Simulate from './pages/Simulate';
import Chat from './pages/Chat';
import Contact from './pages/Contact';
import Regulations2026 from './pages/Regulations2026';
import './App.css';

function App() {
  console.log('🚀 App component rendering...');
  
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/simulate" element={<Simulate />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/regulations-2026" element={<Regulations2026 />} />
            <Route path="/auth" element={<Auth />} />
            {/* Fallbacks for removed routes */}
            <Route path="/compare" element={<Navigate to="/simulate" replace />} />
            <Route path="/corner-performance" element={<Navigate to="/dashboard" replace />} />
            <Route path="/quiz" element={<Navigate to="/regulations-2026" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
