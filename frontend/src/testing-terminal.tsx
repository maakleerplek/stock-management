import { useEffect, useRef } from 'react';
import './testing-terminal.css';

interface TerminalProps {
    logs: string[];
}

function TestingTerminal({ logs }: TerminalProps) {
    const terminalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="terminal-container" ref={terminalRef}>
            <div>
                {logs.length === 0 ? (
                    <span>No data yet.</span>
                ) : (
                    logs.map((log, idx) => <div key={idx}>{log}</div>)
                )}
            </div>
        </div>
    );
}

export default TestingTerminal;