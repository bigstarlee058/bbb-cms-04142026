import { useEffect } from 'react';
import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { Field, FormDrawer } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation, useQuery } from 'react-query';
import { updateTool } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createToolSchema } from '@/utils/yup';
import { useLanguageStore } from '@/stores/languages';
import { fetchLanguages } from '@/lib/api';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { TranslatableInput } from '@/components/Form/TranslatableInput';
import { useTranslations } from '@/hooks/useTranslations';

interface FormikState {
  toolName: string;
  title: string;
  titleTranslations: Record<string, string>;
  visible: boolean;
}

export const UpdateTool = ({ toolId, tools }) => {
  const { addNotification } = useNotificationStore();
  const { data: fetchedLanguages = [] } = useQuery('languages', fetchLanguages);
  const setLanguages = useLanguageStore((state) => state.setLanguages);
  useEffect(() => {
    if (fetchedLanguages.length > 0) {
      setLanguages(fetchedLanguages);
    }
  }, [fetchedLanguages, setLanguages]);

  const toolsData = tools.tools.find(ex => ex._id === toolId);
  const {
    selectedLanguages,
    handleLanguageToggle,
    getFilteredTranslations,
    resetLanguages,
    setSelectedLanguages,
  } = useTranslations({
    translationFields: ['title'],
  });

  useEffect(() => {
  if (!toolsData) return;
  const validKeys = useLanguageStore.getState().languages.map(l => l.key);
  const langs = Object.values(toolsData || {})
    .flatMap(o => (o && typeof o === 'object' ? Object.keys(o) : []))
    .filter(k => validKeys.includes(k));
  
  setSelectedLanguages([...new Set(langs)]);
}, [toolsData, setSelectedLanguages]);

  const initialValues: FormikState = {
    title: toolsData?.title || '',
    toolName: toolsData?.toolName || '',
    titleTranslations: toolsData?.titleTranslations || {},
    visible: toolsData?.visible || false,
  };

  const { mutate, isLoading, isSuccess } = useMutation(updateTool, {
    onSuccess: (message: string) => {
      formik.resetForm();
      resetLanguages();
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const formik = useFormik({
    initialValues,
    validationSchema: createToolSchema,
    onSubmit: (values) => {
      const filteredTranslations = getFilteredTranslations(values,true);
      mutate({
        toolId,
        title: values.title,
        titleTranslations: filteredTranslations.titleTranslations,
        toolName: values.toolName,
        visible: values.visible,
      });
    },
  });

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />
        }
        title="Update Tool"
        submitButton={
          <Button 
            form="update-tool" 
            variant="danger" 
            type="submit" 
            size="sm" 
            isLoading={isLoading}
          >
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        
        <form id="update-tool" onSubmit={formik.handleSubmit}>
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
              <div
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  formik.values.visible 
                    ? 'bg-red-500 peer-checked:bg-bbb' 
                    : 'bg-gray-300 peer-checked:bg-green-500'
                }`}
              >
                <span
                  className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    formik.values.visible ? 'translate-x-5' : ''
                  }`}
                />
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  formik.values.visible ? 'text-bbb' : 'text-gray-900'
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