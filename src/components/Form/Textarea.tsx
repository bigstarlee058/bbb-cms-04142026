import { FormikProps } from 'formik';

import { getFormikError, hasError } from '@/utils/formik';

interface Props {
  formik: FormikProps<any>;
  label?: string;
  name: string;
  placeholder?: string;
}

type InputT = Props & React.InputHTMLAttributes<HTMLInputElement>;

export const Textarea = ({ label, formik, name, placeholder }: InputT) => {
  const error = getFormikError({ formik, name });
  const isInvalid = hasError({ formik, name });
  const fieldValue = formik.getFieldProps(name).value;

  return (
    <div className={`form-group py-2 ${isInvalid ? 'invalid' : 'valid'}`}>
      {label && <label className="fieldLabel">{label}</label>}
      <textarea
        placeholder={placeholder}
        className='rounded-lg h-[210px]'
        value={fieldValue || ''}
        onChange={(e) => formik.setFieldValue(name, e.target.value)}
      />
      {isInvalid && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
};
