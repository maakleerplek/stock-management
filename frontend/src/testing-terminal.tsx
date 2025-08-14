
interface TerminalProps {
    logs: string[];
}

function TestingTerminal({ logs }: TerminalProps) {
    return (
        <div className="terminal-container" style={{ background: "#046737ff", color: "#eee", padding: "1em", minHeight: "150px" }}>
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