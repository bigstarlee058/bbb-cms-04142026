import { FormikProps } from 'formik';
import ReactSelect from 'react-select';
import CreatableSelect from 'react-select/creatable';

import reactSelectStylesConfig from '@/lib/react-select';
import { getFormikError, hasError } from '@/utils/formik';

interface Props {
  formik: FormikProps<any>;
  label: string;
  name: string;
  isCreatable?: boolean;
}

export const Select = ({ formik, label, name, isCreatable = false, ...rest }) => {
  const error = getFormikError({ formik, name });
  const isInvalid = hasError({ formik, name });
  return (
    <div className="py-2">
      <label className="fieldLabel">{label}</label>
      {isCreatable ? (
        <CreatableSelect styles={reactSelectStylesConfig} {...rest} />
      ) : (
        <ReactSelect styles={reactSelectStylesConfig} {...rest} />
      )}
      {isInvalid && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
};
