import { Link, useLocation } from 'react-router-dom';
import AuthButton from './AuthButton';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/simulate', label: 'Telemetry & Sim' },
    { path: '/regulations-2026', label: '2026 Regulations' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="logo-text">AERO</span>
          <span className="logo-accent">VELOCITY</span>
          <span style={{
            fontSize: '10px',
            fontWeight: 800,
            padding: '2px 7px',
            background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)',
            color: '#000',
            borderRadius: '4px',
            letterSpacing: '0.05em'
          }}>
            2026 FIA
          </span>
        </Link>
        
        <div className="navbar-right">
          <ul className="navbar-menu">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`navbar-link ${isActive(link.path) ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <AuthButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
