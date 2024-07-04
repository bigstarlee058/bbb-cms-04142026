import { FormikProps } from 'formik';
import { useState } from 'react';
import { BsEye } from 'react-icons/bs';

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

  return (
    <div className={`form-group px-3 py-2 ${isInvalid ? 'invalid' : 'valid'}`}>
      <label className="fieldLabel">{label}</label>
      <input name={name} onChange={formik.handleChange} value={inputValue} {...rest} type={type} />
      {isInvalid && <p className="text-xs text-danger mt-1">{error}</p>}
      {rest.type === 'password' && (
        <BsEye
          className="mt-2 mr-3"
          onClick={() => setType((p) => (p === 'password' ? 'text' : 'password'))}
        />
      )}
    </div>
  );
};
