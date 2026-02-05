import { useFormik } from 'formik';
import { useMutation,useQueryClient ,useQuery } from 'react-query';
import { PlusIcon } from '@heroicons/react/outline';
import { useNotificationStore } from '@/stores/notifications';
import { createRestdaySchema } from '@/utils/yup';
import { Authorization, ROLES } from '@/lib/authorization';
import { Button } from '@/components/Elements';
import { FormDrawer, Select } from '@/components/Form';
import { createRestday } from "../api";
import { useEffect } from 'react';
import { useLanguageStore } from '@/stores/languages';
import { fetchLanguages } from '@/lib/api';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { TranslatableInput } from '@/components/Form/TranslatableInput';
import { TranslatableTextarea } from '@/components/Form/TranslatableTextarea';
import { useTranslations } from '@/hooks/useTranslations';

interface FormikState {
  title: string;
  titleTranslations: Record<string, string>;
  vimeoId: string;
  vimeoIdTranslations: Record<string, string>;
  description: string;
  descriptionTranslations: Record<string, string>;
  equipments: string[];
}

export const CreateRestday = ({ titles }) => {
  const { addNotification } = useNotificationStore();
  const queryClient = useQueryClient();
  const { data: fetchedLanguages = [] } = useQuery('languages', fetchLanguages);
    const setLanguages = useLanguageStore((state) => state.setLanguages);
    const {
      selectedLanguages,
      handleLanguageToggle,
      resetLanguages,
    } = useTranslations({
      translationFields: ['title', 'vimeoId', 'description']
    });
  
    useEffect(() => {
      if (fetchedLanguages.length > 0) {
        setLanguages(fetchedLanguages);
      }
    }, [fetchedLanguages, setLanguages]);
  const { mutate, isLoading, isSuccess } = useMutation(createRestday, {
    onSuccess: (message: string) => {
      queryClient.invalidateQueries('get-restdays');
      resetLanguages();
      formik.resetForm();
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const equipmentTitles = titles || [];

  const initialValues: FormikState = {
    title: '',
    titleTranslations:{},
    vimeoId: '',
    vimeoIdTranslations:{},
    description: '',
    descriptionTranslations:{},
    equipments: [],
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createRestdaySchema,
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
          <Button size="sm" variant='danger' startIcon={<PlusIcon className="h-4 w-4" />}>
            Create Rest Day
          </Button>
        }
        title="Create Rest Day"
        submitButton={
          <Button form="create-restday" variant='danger' type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="create-restday" onSubmit={formik.handleSubmit}>
         <TranslatableInput
            formik={formik}
            name="title"
            translationField="titleTranslations"
            label="Title"
            selectedLanguages={selectedLanguages}
          />
          <TranslatableInput
            formik={formik}
            name="vimeoId"
            translationField="vimeoIdTranslations"
            label="Vimeo Id"
            selectedLanguages={selectedLanguages}
          />
          <TranslatableTextarea label="Notes"
          formik={formik} name="description"
          translationField={`descriptionTranslations`}
          selectedLanguages={selectedLanguages} />
          <Select
            isMulti
            formik={formik}
            label="Related Equipment"
            name="relatedEquipments"
            options={equipmentTitles?.map(({ title, id }) => ({ label: title, value: id })) || []}
            value={formik.values.equipments.map((id) => {
              const exercise = equipmentTitles?.find((exercise) => exercise._id === id);
              return { label: exercise?.title || '', value: id };
            })}
            onChange={(value: any) =>
              formik.setFieldValue(
                'equipments',
                value.map((v: any) => v.value)
              )
            }
          />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
