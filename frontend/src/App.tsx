import './App.css'
import Scanner from './barcodescanner'
import Qrcode from './qrcode'
import Logo from './logo'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Inventree Assistant</h1>
        <Logo />
        <Scanner />
        <Qrcode />
      </header>
      <footer>
      </footer>
    </div>
  )
}
export default App
