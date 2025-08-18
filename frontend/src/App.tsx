import './App.css'
import Scanner from './barcodescanner'
import ItemContainer from './itemcontainer'
import Qrcode from './qrcode'


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Scanner />
        <ItemContainer />
        <Qrcode />
      </header>
      <footer>
      </footer>
    </div>
  )
}
export default App
