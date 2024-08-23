import { FormikProps } from 'formik';
import ReactSelect, { Props as ReactSelectProps } from 'react-select';

import reactSelectStylesConfig from '@/lib/react-select';

export const Select = ({ name, ...rest }: ReactSelectProps) => {
  return (
    <div className="py-2">
      <ReactSelect styles={reactSelectStylesConfig} {...rest} />
    </div>
  );
};
