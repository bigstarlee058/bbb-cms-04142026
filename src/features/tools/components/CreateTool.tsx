import { useEffect } from 'react';
import { useFormik } from 'formik';
import { useMutation, useQuery } from 'react-query';
import { PlusIcon } from '@heroicons/react/outline';

import { Button } from '@/components/Elements';
import { FormDrawer, Field } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { createToolSchema } from '@/utils/yup';
import { useLanguageStore } from '@/stores/languages';
import { createTool } from '../api';
import { fetchLanguages } from '@/lib/api';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { TranslatableInput } from '@/components/Form/TranslatableInput';
import { useTranslations } from '@/hooks/useTranslations';

interface FormikState {
  title: string;
  titleTranslations: Record<string, string>;
  toolName: string;
  visible: boolean;
}

export const CreateTool = () => {
  const { addNotification } = useNotificationStore();
  const { data: fetchedLanguages = [] } = useQuery('languages', fetchLanguages);
  const setLanguages = useLanguageStore((state) => state.setLanguages);
  const {
    selectedLanguages,
    handleLanguageToggle,
    getFilteredTranslations,
    resetLanguages,
  } = useTranslations({
    translationFields: ['title'],
  });

  useEffect(() => {
    if (fetchedLanguages.length > 0) {
      setLanguages(fetchedLanguages);
    }
  }, [fetchedLanguages, setLanguages]);

  const { mutate, isLoading, isSuccess } = useMutation(createTool, {
    onSuccess: () => {
      handleClose();
      addNotification({ type: 'success', title: "Tool successfully created." });
    }
  });

  const initialValues: FormikState = {
    title: '',
    titleTranslations: {},
    toolName: '',
    visible: false,
  };
  const handleClose = () => {
    formik.resetForm();
    resetLanguages();
  }
  const formik = useFormik({
    initialValues,
    validationSchema: createToolSchema,
    onSubmit: (values) => {
      const translations = getFilteredTranslations(values, true);
      mutate({
        toolName: values.toolName,
        title: values.title,
        titleTranslations: translations?.titleTranslations,
        visible: values.visible,
      });
    },
  });


  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        onClose={() => {
          handleClose();
        }}
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
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="create-tool" onSubmit={formik.handleSubmit}>

          <Field label="Tool Name" formik={formik} name="toolName" />
          <TranslatableInput
            formik={formik}
            name="title"
            translationField="titleTranslations"
            label="Title"
            selectedLanguages={selectedLanguages}
          />
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
              <div className={`relative w-11 h-6 rounded-full transition-colors ${formik.values.visible ? 'bg-red-500 peer-checked:bg-bbb' : 'bg-gray-300 peer-checked:bg-green-500'
                }`}
              >
                <span className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${formik.values.visible ? 'translate-x-5' : ''
                  }`}
                />
              </div>
              <span className={`ml-2 text-sm font-medium ${formik.values.visible ? 'text-bbb' : 'text-gray-900'
                }`}
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