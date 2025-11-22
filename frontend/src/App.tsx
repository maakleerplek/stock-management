import { useState, useCallback, useEffect } from 'react';
import './App.css';
import Scanner from './barcodescanner';
import Qrcode from './qrcode';
import Logo from './logo';
import { type ItemData } from './sendCodeHandler';
import TestingTerminal from './testing-terminal';
import LightOrDarkButton from './LightOrDarkButton';
import ShoppingWindow from './ShoppingWindow';

function App() {
  const [logs, setLogs] = useState<string[]>([]);
  const [theme, setTheme] = useState('light');
  const [scannedItem, setScannedItem] = useState<ItemData | null>(null);


  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  /** Add a log message to the terminal */
  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [...prev, msg]);
  }, []);
  
  const handleItemScanned = (item: ItemData) => {
    setScannedItem(null); // Reset to null first to ensure re-trigger
    setTimeout(() => setScannedItem(item), 0);
  }

  return (
    <div className="App">
      <div className="main-layout">
        <div className="content-area">
          <div className="top-bar">
            <Logo />
            <LightOrDarkButton toggleTheme={toggleTheme} />
          </div>
          <TestingTerminal logs={logs} />
          <Scanner addLog={addLog} onItemScanned={handleItemScanned} />
          <Qrcode />
        </div>
        <ShoppingWindow addLog={addLog} scannedItem={scannedItem} />
      </div>
    </div>
  );
}

export default App;
