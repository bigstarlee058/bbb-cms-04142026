import { FormikProps } from 'formik';
import ReactQuill from 'react-quill';
import './quill.snow.css';

import { getFormikError, hasError } from '@/utils/formik';

interface Props {
  formik: FormikProps<any>;
  label?: string;
  name: string;
  placeholder?: string;
}

type InputT = Props & React.InputHTMLAttributes<HTMLInputElement>;

export const TextareaWithFormatting = ({ label, formik, name, placeholder }: InputT) => {
  const error = getFormikError({ formik, name });
  const isInvalid = hasError({ formik, name });
  const fieldValue = formik.getFieldProps(name).value;

  console.log("fieldValue", fieldValue);

  return (
    <div className={`form-group py-2 ${isInvalid ? 'invalid' : 'valid'} h-[250px]`}>
      {label && <label className="fieldLabel">{label}</label>}
      <ReactQuill
        theme="snow"
        placeholder={placeholder}
        value={fieldValue || ''}
        onChange={(value) => formik.setFieldValue(name, value)}
        className='rounded-lg'
        modules={{
          toolbar: [
            // [{ 'header': [1, 2, 3, 4, false] }],
            ['bold', 'italic', 'underline','strike'],
            ['clean']
          ],
        }}
        formats={[
            // 'header',
            'bold', 'italic', 'underline', 'strike',
        ]}
      />
      {isInvalid && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
};
