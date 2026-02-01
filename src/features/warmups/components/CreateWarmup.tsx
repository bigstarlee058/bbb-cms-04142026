import { useFormik } from 'formik';
import { useMutation, useQuery } from 'react-query';
import { queryClient } from '@/lib/react-query';
import { PlusIcon } from '@heroicons/react/outline';
import { useNotificationStore } from '@/stores/notifications';
import { createWarmupSchema } from '@/utils/yup';
import { Authorization, ROLES } from '@/lib/authorization';
import { Button } from '@/components/Elements';
import { Dropzone, FormDrawer, Select } from '@/components/Form';
import { useEffect } from "react"
import { Field } from '@/components/Form';
import { createWarmup } from '../api';
import { useLanguageStore } from '@/stores/languages';
import { fetchLanguages } from '@/lib/api';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { TranslatableInput } from '@/components/Form/TranslatableInput';
import { useTranslations } from '@/hooks/useTranslations';
import { TranslatableTextarea } from '@/components/Form/TranslatableTextarea';
import { prepareTranslations } from '@/utils/translationHelper';
interface FormikState {
  title: string;
  titleTranslations: Record<string, string>;
  vimeoId: string;
  vimeoIdTranslations: Record<string, string>;
  description: string;
  descriptionTranslations: Record<string, string>;
  equipments: string[];
  length: number;
  thumbnail: any;
  videoThumbnail: any;
  deleteImage: boolean;
  deleteVideoThumbnail: boolean;
}

export const CreateWarmUp = ({ titles }) => {
  const { addNotification } = useNotificationStore();
  const { data: fetchedLanguages = [] } = useQuery('languages', fetchLanguages);
  const setLanguages = useLanguageStore((state) => state.setLanguages);
  const {
    selectedLanguages,
    handleLanguageToggle,
    resetLanguages,
    getFilteredTranslations,
  } = useTranslations({
    translationFields: ['title', 'description', 'vimeoId'],
  });

  useEffect(() => {
    if (fetchedLanguages.length > 0) {
      setLanguages(fetchedLanguages);
    }
  }, [fetchedLanguages, setLanguages]);

  const { mutate, isLoading, isSuccess } = useMutation(createWarmup, {
    onSuccess: (message: string) => {
      formik.resetForm();
      resetLanguages();
      queryClient.invalidateQueries('get-warmups');
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const equipmentTitles = titles || [];

  const initialValues: FormikState = {
    title: '',
    titleTranslations: {},
    vimeoId: '',
    vimeoIdTranslations: {},
    description: '',
    descriptionTranslations: {},
    equipments: [],
    length: 0,
    thumbnail: '',
    videoThumbnail: '',
    deleteImage: false,
    deleteVideoThumbnail: false,
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createWarmupSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (values: any) => {
    const translations = prepareTranslations({
      values,
      translations: getFilteredTranslations(values, true),
      selectedLanguages,
      textFields: ['title', 'description', 'vimeoId'],
      imageFields:[],
    });
    const payload = {
      ...values, ...translations
    }
    mutate(payload);
  };
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button size="sm" variant='danger' startIcon={<PlusIcon className="h-4 w-4" />}>
            Create Warmup
          </Button>
        }
        title="Create Warmup"
        submitButton={
          <Button form="create-warmup" variant='danger' type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="create-warmup" onSubmit={formik.handleSubmit} className='space-y-4'>
          <div className="row">
            <TranslatableInput
              formik={formik}
              name="title"
              translationField="titleTranslations"
              label="Title"
              selectedLanguages={selectedLanguages}
            />
          </div>
          <div className="row">
            <Dropzone
              label="Thumbnail"
              name="thumbnail"
              formik={formik}
              defaultImg={formik.values.thumbnail}
              onDrop={(img) => formik.setFieldValue('thumbnail', img)}
              onDelete={() => formik.setValues({ ...formik.values, thumbnail: '', deleteImage: true })}
            />
          </div>
          <div className="row">
            <TranslatableInput
              formik={formik}
              name="vimeoId"
              translationField="vimeoIdTranslations"
              label="Vimeo Id"
              selectedLanguages={selectedLanguages}
            />
          </div>
          <div className="row">
            <Dropzone
              label="Video Thumbnail"
              name="videoThumbnail"
              formik={formik}
              defaultImg={formik.values.videoThumbnail}
              onDrop={(img) => formik.setFieldValue('videoThumbnail', img)}
              onDelete={() => formik.setValues({ ...formik.values, videoThumbnail: '', deleteVideoThumbnail: true })}
            />
          </div>
          <div className='row'>
            <TranslatableTextarea formik={formik}
              name="description"
              label="Description"
              selectedLanguages={selectedLanguages}
              placeholder="Enter description" />
          </div>
          <div className='row'>
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
          </div>
          <Field label="Length (min)" formik={formik} name="length" />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
