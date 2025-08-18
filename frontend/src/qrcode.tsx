import codeImg from './assets/code_202508181659032.png';

function PayconiqQrCode() {
    const handleClick = () => {
        window.open("https://payconiq.com/merchant/1/616941d236664900073738ce", "_blank");
    };

    return (
            <><h1>Payconiq QR Code</h1><p>With a phone you can click on the QR code to pay with Payconiq.</p><img
            src={codeImg}
            alt="Payconiqqrcode"
            style={{ width: "80px", height: "80px", objectFit: "contain", cursor: "pointer" }}
            onClick={handleClick} /></>
    );
}

export default PayconiqQrCode;