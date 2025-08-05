import { PencilIcon, PlusIcon } from '@heroicons/react/outline';
import { useFormik } from 'formik';
import { useMutation } from 'react-query';

import { Button } from '@/components/Elements';
import { FormDrawer, Field, Dropzone } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { updateVersionSchema } from '@/utils/yup';
import { updateVersion } from './api';
import { Textarea } from '@/components/Form';

interface FormikState {
  androidVersion: string;
  iosVersion: string;
  androidForceUpdate: boolean;
  iosForceUpdate: boolean;
  updateTitle: string;
  updateMessage: string;
}

export const UpdateVersion = ({screenData}) => {
  const { addNotification } = useNotificationStore();

  const initialValues: FormikState = {
    androidVersion: screenData?.android?.version || '1.0.0',
    iosVersion: screenData?.ios?.version || '1.0.0',
    androidForceUpdate: screenData?.android?.forceUpdate || false,
    iosForceUpdate: screenData?.ios?.forceUpdate || false,
    updateTitle: screenData?.update_title || '',
    updateMessage: screenData?.update_message || '',
  };

  const formik = useFormik({
    initialValues,
    validationSchema: updateVersionSchema,
    onSubmit: (v) => onSubmit(v)
  });

  const { mutate, isLoading, isSuccess } = useMutation(updateVersion, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message
      });
    }
  });

  const onSubmit = (state: FormikState) => {
    const { androidVersion, iosVersion, androidForceUpdate, iosForceUpdate, updateTitle, updateMessage } = state;
    mutate({ 
      android: { version: androidVersion, forceUpdate: androidForceUpdate },
      ios: { version: iosVersion, forceUpdate: iosForceUpdate },
      update_title: updateTitle,
      update_message: updateMessage
    });
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button size="sm" variant="danger" startIcon={<PencilIcon className="h-4 w-4" />}>
            &nbsp;Update Version
          </Button>
        }
        title="Update Version Details"
        submitButton={
          <Button form="update-version" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-version" onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Android Version Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 12a2 2 0 114 0 2 2 0 01-4 0z"/>
                </svg>
              </div>
              Android
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Version" formik={formik} name="androidVersion" />
              <div className="flex items-center justify-between">
                <label htmlFor="androidForceUpdate" className="text-base font-medium text-gray-700">
                  Force Update Required
                </label>
                <button
                  type="button"
                  onClick={() => formik.setFieldValue('androidForceUpdate', !formik.values.androidForceUpdate)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                    formik.values.androidForceUpdate ? 'bg-red-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formik.values.androidForceUpdate ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* iOS Version Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 12a2 2 0 114 0 2 2 0 01-4 0z"/>
                </svg>
              </div>
              iOS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Version" formik={formik} name="iosVersion" />
              <div className="flex items-center justify-between">
                <label htmlFor="iosForceUpdate" className="text-base font-medium text-gray-700">
                  Force Update Required
                </label>
                <button
                  type="button"
                  onClick={() => formik.setFieldValue('iosForceUpdate', !formik.values.iosForceUpdate)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                    formik.values.iosForceUpdate ? 'bg-red-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formik.values.iosForceUpdate ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* General Update Info */}
          <div className="space-y-4">
            <Field label="Update Title" formik={formik} name="updateTitle" />
            <Textarea label="Update Message" formik={formik} name="updateMessage" />
          </div>
        </form>
      </FormDrawer>
    </Authorization>
  );
};
