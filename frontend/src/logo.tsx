import logo from './assets/HTL.png';


function Logo(){
    return(
        <a href="https://maakleerplek.be/" target="_blank" rel="noopener noreferrer">
            <img src={logo} alt="logo" style={{width: "100px", height: "100px"}}/>
        </a>
    )
}


export default Logo