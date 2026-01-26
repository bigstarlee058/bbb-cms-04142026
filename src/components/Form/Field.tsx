import { FormikProps } from 'formik';
import { useState } from 'react';
import { BsEye, BsPerson } from 'react-icons/bs';

import { getFormikError, getFormikValue, hasError } from '@/utils/formik';

interface Props {
  formik: FormikProps<any>;
  label: string;
  name: string;
}

type InputT = Props & React.InputHTMLAttributes<HTMLInputElement>;

export const Field = ({ label, formik, name, ...rest }: InputT) => {
  const [type, setType] = useState(rest.type || 'text');
  const error = getFormikError({ formik, name });
  const isInvalid = hasError({ formik, name });
  const inputValue = getFormikValue({ formik, name });
  const isChecked = getFormikValue({ formik, name });

  const isEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  return (
    <div className={`form-group ${label?"py-2":""} w-100 ${isInvalid ? 'invalid' : 'valid'} relative`}>
      <div className="relative">
        {label && (<label className="fieldLabel">{label}</label>)}
        <input
          placeholder={label}
          className="rounded-md shadow-2xl"
          name={name}
          // onChange={formik.handleChange}
          onChange={(e) => {
            let val = e.target.value;

            // Only modify the link field
            if (
              name === 'link' &&
              val &&
              isEmail(val) &&
              !val.startsWith('mailto:')
            ) {
              val = `mailto:${val}`;
            }

            formik.setFieldValue(name, val);
          }}
          value={inputValue}
          checked={isChecked}
          {...rest}
          type={type}
        />
        {rest.type === 'email' && (
            <BsPerson
            className="absolute right-3 top-1/2 text-gray-400"
            aria-hidden="true"
            />
        )}
        {rest.type === 'password' && (
          <div className="text-primary">
            <BsEye
              className="absolute right-3 top-1/2"
              onClick={() => setType((p) => (p === 'password' ? 'text' : 'password'))}
            />
          </div>
        )}
      </div>
      {isInvalid && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
};
