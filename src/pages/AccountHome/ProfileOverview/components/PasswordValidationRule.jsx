import { X, Check } from "lucide-react";


const PasswordValidationRule = ({ isValid, text }) => (
  <li className={isValid ? "valid" : "invalid"}>
    {isValid ? <Check size={16} /> : <X size={16} />}
    {text}
  </li>
);

export default PasswordValidationRule;