import { FormikProps } from 'formik';
import './quill.snow.css';
import { useQuill} from 'react-quilljs';

import { getFormikError, hasError } from '@/utils/formik';
import { useEffect } from 'react';

interface Props {
  formik: FormikProps<any>;
  label?: string;
  name: string;
  placeholder?: string;
}

type InputT = Props & React.InputHTMLAttributes<HTMLInputElement>;

export const TextareaWithFormatting = ({ label, formik, name, placeholder }: InputT) => {
  const { quill, quillRef } = useQuill({
    modules: {
      toolbar: [
        [{ 'header': [1, 2, 3, 4, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ],
    },
    formats: ['header', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'indent',],
  });

  const error = getFormikError({ formik, name });
  const isInvalid = hasError({ formik, name });
  const fieldValue = formik.getFieldProps(name).value;

  console.log("fieldValue", fieldValue);

  useEffect(() => {
    if (quill) {
      quill.clipboard.dangerouslyPasteHTML(fieldValue || '');
      quill.on('text-change', (delta, oldDelta, source) => {
        formik.setFieldValue(name, quill.root.innerHTML);
      });
    }
  }, [quill]);

  return (
    <div className={`form-group py-2 ${isInvalid ? 'invalid' : 'valid'} h-[250px]`}>
      {label && <label className="fieldLabel">{label}</label>}
      <div ref={quillRef} />
      {isInvalid && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
};
