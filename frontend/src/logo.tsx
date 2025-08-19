import logo from './assets/HTL.png';
import "./logo.css"
function Logo(){
    return(
        <a href="https://maakleerplek.be/" target="_blank" rel="noopener noreferrer">
            <img src={logo} alt="logo" className="app-logo"/>
        </a>
    )
}


export default Logo