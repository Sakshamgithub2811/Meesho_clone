import fs from 'fs';

const file = 'd:/Meesho/Meesho_clone/frontend/src/pages/delivery & driver logistics/active_delivery_mobile.jsx';
let code = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

code = code.replace(
  "  const [otpError, setOtpError] = useState('');",
  `  const [otpError, setOtpError] = useState('');

  const activeOrderId = 'MSH-99281';
  const expectedOtp = React.useMemo(() => {
    const seed = activeOrderId.split('').reduce((acc, char) => (acc * 33 + char.charCodeAt(0)) % 9000, 1000);
    return String(Math.abs(seed) + 1000);
  }, [activeOrderId]);`
);

code = code.replace(
  "if (driverOtp === '4829' || driverOtp === '1234') {",
  "if (driverOtp === expectedOtp || driverOtp === '1234') {"
);

code = code.replace(
  "setOtpError('Invalid OTP! Please check with customer or click Resend SMS.');",
  "setOtpError(`Invalid OTP! Please check with customer (Expected: ${expectedOtp}).`);"
);

code = code.replace(
  '<span className="text-[11px] text-slate-400">Dev Hint: OTP is 4829</span>',
  '<span className="text-[11px] text-slate-400">Customer OTP: {expectedOtp}</span>'
);

fs.writeFileSync(file, code.replace(/\n/g, '\r\n'), 'utf8');
console.log('Successfully updated active_delivery_mobile.jsx to dynamic OTP');

