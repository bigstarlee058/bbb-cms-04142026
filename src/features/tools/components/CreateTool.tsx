import { PlusIcon } from '@heroicons/react/outline';
import { useFormik } from 'formik';
import { useMutation } from 'react-query';

import { Button } from '@/components/Elements';
import { FormDrawer, Field } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { createToolSchema } from '@/utils/yup';

import { createTool } from '../api';
interface FormikState {
  title: string;
  toolName: string;
  visible: boolean;
}

export const CreateTool = () => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(createTool, {
    onSuccess: () => {
      formik.resetForm();
      addNotification({
        type: 'success',
        title: "Tool successfully created.",
      });
    },
  });
  const initialValues: FormikState = {
    title: '',
    toolName: '',    
    visible: false,
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createToolSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (value: any) => {
    mutate(value);
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button size="sm" variant="danger" startIcon={<PlusIcon className="h-4 w-4" />}>
            Create Tool
          </Button>
        }
        title="Create Tool"
        submitButton={
          <Button form="create-tool" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="create-tool" onSubmit={formik.handleSubmit}>
          <Field label="Title" formik={formik} name="title" />
          <Field label="Tool Name" formik={formik} name="toolName" />
           <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visible
            </label>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formik.values.visible}
                onChange={() => formik.setFieldValue('visible', !formik.values.visible)}
              />
              <div
                className={`relative w-11 h-6 rounded-full transition-colors 
                  ${formik.values.visible ? 'bg-red-500 peer-checked:bg-[#9a354e]' : 'bg-gray-300 peer-checked:bg-green-500'}`}
              >
                <span
                  className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform 
                    ${formik.values.visible ? 'translate-x-5' : ''}`}
                />
              </div>
              <span
                className={`ml-2 text-sm font-medium ${formik.values.visible ? 'text-[#9a354e]' : 'text-gray-900'}`}
              >
                {formik.values.visible ? 'Yes' : 'No'}
              </span>
            </label>
          </div>
        </form>
      </FormDrawer>
    </Authorization>
  );
};
