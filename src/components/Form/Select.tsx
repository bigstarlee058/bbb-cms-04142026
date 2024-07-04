import { FormikProps } from 'formik';
import ReactSelect, { Props as ReactSelectProps } from 'react-select';

import reactSelectStylesConfig from '@/lib/react-select';
import { getFormikError, hasError } from '@/utils/formik';

interface Props {
  formik: FormikProps<any>;
  label: string;
  name: string;
}

export const Select = ({ formik, label, name, ...rest }: Props & ReactSelectProps) => {
  const error = getFormikError({ formik, name });
  const isInvalid = hasError({ formik, name });
  return (
    <div className="px-3 py-2">
      <label className="fieldLabel">{label}</label>
      <ReactSelect styles={reactSelectStylesConfig} {...rest} />
      {isInvalid && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
};
