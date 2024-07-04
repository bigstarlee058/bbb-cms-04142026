import { FormikProps } from 'formik';
import { useRef, useState } from 'react';
import { BiTrash } from 'react-icons/bi';

import { getFormikError, hasError } from '@/utils/formik';

interface Props {
  defaultImg?: string;
  label?: string;
  formik: FormikProps<any>;
  name: string;
  onDrop: (file: File) => void;
  onDelete: () => void;
}

export const Dropzone = ({ defaultImg, label, formik, name, onDrop, onDelete }: Props) => {
  const [preview, setPreview] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  const error = getFormikError({ formik, name });
  const isInvalid = hasError({ formik, name });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // if size is greater than 5MB
    if (file.size > 5 * 1024 * 1024) return alert('File size should be less than 5MB');

    // if file type is not image
    if (!file.type.includes('image')) return alert('Only images are allowed');

    setPreview(URL.createObjectURL(file));
    onDrop(file);
  };

  return (
    <div className="px-2 py-3">
      <label className="fieldLabel">{label}</label>
      <div className="w-full md:w-[200px] h-[220px] border-2 border-tertiary border-dashed rounded-xl flex items-center justify-center relative cursor-pointer overflow-hidden">
        <input
          type="file"
          className="text-[0] border-0 absolute inset-0 cursor-pointer opacity-0 z-[5]"
          title=""
          onChange={onChange}
          accept="image/*"
          multiple={false}
          ref={ref}
        />
        {preview || defaultImg ? (
          <div className="flex items-center justify-center">
            <img
              className="absolute w-full h-full inset-0 !bg-no-repeat !bg-center"
              src={preview || defaultImg}
              alt="Thumbnail"
            />
            <span
              className="w-10 h-10 flex items-center justify-center bg-white rounded-full z-10"
              onClick={() => {
                setPreview('');
                onDelete();
                if (ref.current) ref.current.value = '';
              }}
            >
              <BiTrash className="w-5 h-5 text-danger" />
            </span>
          </div>
        ) : (
          <span className="text-sm text-center text-dark">Drag and drop, or click to select</span>
        )}
      </div>
      {isInvalid && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
};
