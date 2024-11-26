import { useState } from 'react';
import { BsEye, BsPerson } from 'react-icons/bs';

export const Field = ({ label, name, value, onChange, disabled = false, ...rest }) => {
  const [type, setType] = useState(rest.type || 'text');

  return (
    <div className={`form-group py-2 w-100 relative`}>
      <label className="fieldLabel">{label}</label>
      <input
        placeholder={label}
        className={`rounded-md shadow-2xl ${disabled && 'cursor-not-allowed opacity-50'}`}
        name={name}
        onChange={(e) => onChange(name, e.target.value)}
        value={value || ''}
        {...rest}
        type={type}
      />
      {rest.type === 'email' && (
        <BsPerson className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
      )}
      {rest.type === 'password' && (
        <div className="text-primary">
          <BsEye
            className="absolute right-3 top-1/2 -translate-y-1/2"
            onClick={() => setType((p) => (p === 'password' ? 'text' : 'password'))}
          />
        </div>
      )}
    </div>
  );
};
