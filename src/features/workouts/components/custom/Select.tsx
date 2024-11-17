import { FormikProps } from 'formik';
import ReactSelect, { Props as ReactSelectProps } from 'react-select';

import reactSelectStylesConfig from '@/lib/react-select';

export interface CustomSelectProps extends ReactSelectProps {
  label: string;
}
export const Select = ({ label, name, ...rest }: CustomSelectProps) => {
  return (
    <>
      <label className="fieldLabel">{label}</label>
      <ReactSelect styles={reactSelectStylesConfig} {...rest} />
    </>
  );
};
