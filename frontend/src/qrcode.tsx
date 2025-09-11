import codeImg from './assets/code_202508181659032.png';
import './qrcode.css'
function PayconiqQrCode() {
    const handleClick = () => {
        window.open("https://payconiq.com/merchant/1/616941d236664900073738ce", "_blank");
    };

    return (
        <div className="payconiq-container">
            <h2>Pay with Payconiq</h2>
            <p>Click the QR code to open the payment link.</p>
            <img
                src={codeImg}
                alt="Payconiqqrcode"
                className="payconiq-qr"
                onClick={handleClick} />
        </div>
    );
}

export default PayconiqQrCode;