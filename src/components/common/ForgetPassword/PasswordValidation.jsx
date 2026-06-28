import React from 'react';
import './ForegetPassord.css';
import { SmallCheck, SmallX } from '../../../assets/icons';

const PasswordValidation = ({ password = '', validations }) => {
  const defaultValidations = [
    {
      key: 'minLength',
      label: 'Minimum 8 characters',
      isValid: password.length >= 8,
    },
    {
      key: 'hasNumber',
      label: 'Atleast 1 number (1-9)',
      isValid: /\d/.test(password),
    },
    {
      key: 'hasLetters',
      label: 'Atleast lowercase or uppercase letters',
      isValid: /[a-zA-Z]/.test(password),
    },
  ];

  const rules = validations || defaultValidations;

  return (
    <div className="validation-rules">
      {rules.map((rule) => (
        <div
          key={rule.key}
          className={`validation-rule`}
        >
          {rule.isValid ? (
            <SmallCheck className="validation-rule-icon" />
          ) : (
            <SmallX className="validation-rule-icon" />
          )}
          <span>{rule.label}</span>
        </div>
      ))}
    </div>
  );
};

export default PasswordValidation;