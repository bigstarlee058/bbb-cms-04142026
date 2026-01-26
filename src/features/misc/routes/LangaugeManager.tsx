import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/solid';
import { Button, ConfirmationDialog } from '@/components/Elements';
import { Field, FormDrawer } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation, useQuery } from 'react-query';
import { useEffect } from 'react';
import { adminLanguages, updateLanguage, deleteLanguage, createLanguage } from '@/lib/api';
import { useNotificationStore } from '@/stores/notifications';
import { useLanguageStore } from '@/stores/languages'
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useState } from 'react';

const languageSchema = Yup.object().shape({
  key: Yup.string().required('Key is required').min(2).max(3),
  name: Yup.string().required('Name is required')
});



const AddLanguage = ({ refetch }) => {
  const { addNotification } = useNotificationStore();

  const { mutate, isLoading, isSuccess } = useMutation(createLanguage, {
    onSuccess: (message) => {
      addNotification({ type: 'success', title: message });
      refetch();
    },
    onError: (error: any) => {
      addNotification({ type: 'error', title: error.message });
    }
  });

  const formik = useFormik({
    initialValues: { key: '', name: '', inUse: false },
    validationSchema: languageSchema,
    enableReinitialize: true,
    onSubmit: (values) => mutate(values)
  });
  const handleClose = () => {
    formik.resetForm();
  }
  return (
    <FormDrawer
      onClose={() => {
        handleClose();
      }}
      isDone={isSuccess}
      triggerButton={
        <Button size="sm" variant="danger" startIcon={<PlusIcon className="h-4 w-4" />}>
          Add
        </Button>
      }
      title="Add Language"
      submitButton={
        <Button form="add-language" variant="danger" type="submit" size="sm" isLoading={isLoading}>
          Submit
        </Button>
      }
    >
      <form id="add-language" onSubmit={formik.handleSubmit}>
        <Field label="Key" formik={formik} name="key" maxLength={3} />
        <Field label="Name" formik={formik} name="name" />
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            In use 
          </label>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={formik.values.inUse}
              onChange={() => formik.setFieldValue('inUse', !formik.values.inUse)}
            />
            <div
              className={`relative w-11 h-6 rounded-full transition-colors ${formik.values.inUse
                ? 'bg-red-500 peer-checked:bg-bbb'
                : 'bg-gray-300 peer-checked:bg-green-500'
                }`}
            >
              <span
                className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${formik.values.inUse ? 'translate-x-5' : ''
                  }`}
              />
            </div>
            <span
              className={`ml-2 text-sm font-medium ${formik.values.inUse ? 'text-bbb' : 'text-gray-900'
                }`}
            >
              {formik.values.inUse ? 'Yes' : 'No'}
            </span>

          </label>
        </div>
      </form>
    </FormDrawer>
  );
};

const EditLanguage = ({ language, refetch }) => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(updateLanguage, {
    onSuccess: (message) => {
      addNotification({ type: 'success', title: message });
      refetch();
    },
    onError: (error: any) => {
      addNotification({ type: 'error', title: error.message });
    }
  });

  const formik = useFormik({
    initialValues: { key: language.key, name: language.name, inUse: language.inUse },
    validationSchema: languageSchema,
    onSubmit: (values) => mutate({ id: language._id, payload: values })
  });

  return (
    <FormDrawer
      isDone={isSuccess}
      triggerButton={
        <Button size="sm" variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />
      }
      title="Edit Language"
      submitButton={
        <Button form="edit-language" variant="danger" type="submit" size="sm" isLoading={isLoading}>
          Submit
        </Button>
      }
    >
      <form id="edit-language" onSubmit={formik.handleSubmit}>
        <Field label="Key" formik={formik} name="key" maxLength={3} />
        <Field label="Name" formik={formik} name="name" />
      </form>
    </FormDrawer>
  );
};

const DeleteLanguage = ({ languageId, languageName, refetch }) => {
  const { addNotification } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);

  const { mutate, isSuccess, isLoading } = useMutation(deleteLanguage, {
    onSuccess: (message) => {
      addNotification({ type: 'success', title: message });
      setIsOpen(false);
      refetch();
    },
    onError: (error: any) => {
      addNotification({ type: 'error', title: error.message });
    }
  });

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <ConfirmationDialog
        icon="danger"
        title="Delete Language"
        body={`Are you sure you want to delete ${languageName} ?`}
        isDone={isSuccess}
        triggerButton={
          <Button variant="danger" startIcon={<TrashIcon className="h-4 w-4" />}></Button>
        }
        confirmButton={
          <Button
            isLoading={isLoading}
            type="button"
            className="bg-red-600"
            onClick={async () => {
              await mutate(languageId);
            }}
          >
            Delete Language
          </Button>
        }
      />
    </Authorization>
  );
};

export const LanguageManager = () => {

  const { data: languages = [], refetch } = useQuery('languages', adminLanguages);
  const setLanguages = useLanguageStore((state) => state.setLanguages);
  const { addNotification } = useNotificationStore();
  const toggleLanguageStatus = useMutation(
    (id: string) => {
      const lang = languages.find(l => l._id === id);
      return updateLanguage({ id, payload: { inUse: !lang?.inUse } });
    },
    {
      onSuccess: (message) => {
        addNotification({ type: 'success', title: message });
        refetch();
      },
      onError: (error: any) => {
        addNotification({ type: 'error', title: error.message });
      }
    }
  );
  useEffect(() => {
    if (languages) {
      setLanguages(languages);
    }
  }, [languages, setLanguages]);

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <div className="bg-white border border-gray-200 rounded-md p-3 shadow-sm text-xs flex flex-col h-full">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-900 text-xs">
            Booty By Bret Available in Languages
          </h3>
          <AddLanguage refetch={refetch} />
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {languages.length === 0 ? (
            <p className="text-[11px] text-gray-500 text-center py-2">
              No languages yet
            </p>
          ) : (
            languages.map((lang) => (
              <div
                key={lang._id}
                className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded border border-gray-200"
              >
                <span className="text-[14px]">
                  <span className="font-mono font-semibold text-bbb">
                    {lang.key}
                  </span>
                  <span className="text-gray-600 ml-1.5">{lang.name}</span>
                </span>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={lang.inUse}
                    onChange={() => toggleLanguageStatus.mutate(lang._id)}
                  />
                  <div
                    className={`relative w-11 h-6 rounded-full transition-colors ${lang.inUse ? 'bg-bbb' : 'bg-gray-300'
                      }`}
                  >
                    <span
                      className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${lang.inUse ? 'translate-x-5' : ''
                        }`}
                    />
                  </div>
                  <span
                    className={`ml-2 text-[11px] font-medium ${lang.inUse ? 'text-bbb' : 'text-gray-500'
                      }`}
                  >
                    {lang.inUse ? 'In use' : 'Not in use'}
                  </span>
                </label>
                <div className="flex gap-1">
                  <EditLanguage language={lang} refetch={refetch} />
                  <DeleteLanguage
                    languageId={lang._id}
                    languageName={lang.name}
                    refetch={refetch}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Authorization>
  );
};