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
  const [theme, setTheme] = useState('light');
  const [scannedItem, setScannedItem] = useState<ItemData | null>(null);
  const [showContent, setShowContent] = useState(false); // New state for animation
  const [logs, setLogs] = useState<string[]>([]); // State for logs

  useEffect(() => {
    // Start the animation after a short delay
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 100); // Small delay to ensure CSS is ready

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    // Use the View Transitions API if available
    if (!document.startViewTransition) {
      // Fallback for browsers that don't support the API
      setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
      return;
    }

    // Wrap the state update in startViewTransition
    document.startViewTransition(() => {
      setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    });
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
      <div className={`main-layout ${showContent ? 'animate-in' : ''}`}>
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
