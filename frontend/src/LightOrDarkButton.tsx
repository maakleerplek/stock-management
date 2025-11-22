import React from 'react';
import './light-or-dark-button.css';
import ThemeIcon from './assets/LightDark.svg';

interface LightOrDarkButtonProps {
  toggleTheme: () => void;
}

const LightOrDarkButton: React.FC<LightOrDarkButtonProps> = ({ toggleTheme }) => {
  return (
    <button onClick={toggleTheme} className="theme-toggle-button">
      <img src={ThemeIcon} alt="Toggle light and dark theme" />
    </button>
  );
};

export default LightOrDarkButton;