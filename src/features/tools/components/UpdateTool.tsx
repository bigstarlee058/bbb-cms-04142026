import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { Field, FormDrawer,} from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation } from 'react-query';
import { updateTool } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createToolSchema } from '@/utils/yup';
interface FormikState {
  toolName:string;
  title: string;
  visible: boolean;
}

export const UpdateTool = ({ toolId, tools }) => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(updateTool, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const toolsData = tools.tools.find(ex => ex._id === toolId);

  const initialValues: FormikState = {
    title: toolsData?.title || '',
    toolName: toolsData?.toolName || '',
    visible: toolsData?.visible || false,
  };

  const formik = useFormik({
    initialValues,
    validationSchema: createToolSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (state: FormikState) => {
    const { title, toolName, visible } = state;
    mutate({toolId, title, toolName, visible });
  };
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Tool"
        submitButton={
          <Button form="update-tool" variant='danger' type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-tool" onSubmit={formik.handleSubmit}>
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
