import logo from './assets/HTL.png';
import './logo.css';

function Logo() {
  return (
    <div className="logo-container">
      <a
        href="https://maakleerplek.be/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="maakleerplek website"
        className="logo-link"
      >
        <img src={logo} alt="maakleerplek logo" className="app-logo" />
      </a>
      <div className="logo-text">
        <h1 className="logo-title">Inventree Assistant</h1>
        <p className="logo-subtitle">by Maakleerplek</p>
      </div>
    </div>
  );
}

export default Logo;