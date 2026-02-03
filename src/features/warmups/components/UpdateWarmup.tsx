import {  useEffect } from 'react';
import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { Field, FormDrawer, Dropzone, Select } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { updateWarmup } from "../api";
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createWarmupSchema } from '@/utils/yup';
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
  deleteThumbnail: boolean;
  deletevideoThumbnail: boolean;
}

export const UpdateWarmup = ({ warmupId, warmups, titles }) => {
  const { addNotification } = useNotificationStore();
  const queryClient = useQueryClient();
  const { data: fetchedLanguages = [] } = useQuery('languages', fetchLanguages);
  const setLanguages = useLanguageStore((state) => state.setLanguages);
  const {
    selectedLanguages,
    handleLanguageToggle,
    resetLanguages,
    getFilteredTranslations,
    setSelectedLanguages,
  } = useTranslations({
    translationFields: ['title', 'description', 'vimeoId'],
  });
  useEffect(() => {
    if (fetchedLanguages.length > 0) {
      setLanguages(fetchedLanguages);
    }
  }, [fetchedLanguages, setLanguages]);
  const warmupData = warmups.warmups.find(wu => wu._id === warmupId);
  useEffect(() => {
    if (!warmups) return;
    const apiLanguages = useLanguageStore.getState().languages.map(l => l.key);

    const langs = Object.values(warmupData || {})
      .flatMap(obj => obj && typeof obj === 'object' ? Object.keys(obj) : [])
      .filter(key => apiLanguages.includes(key));

    setSelectedLanguages([...new Set(langs)]);
  }, [warmupData, setSelectedLanguages]);
  const { mutate, isLoading, isSuccess } = useMutation(updateWarmup, {
    onSuccess: (message: string) => {
      queryClient.invalidateQueries('get-warmups');
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
    title: warmupData?.title || '',
    titleTranslations: warmupData?.titleTranslations || {},
    vimeoId: warmupData?.vimeoId || '',
    vimeoIdTranslations: warmupData?.vimeoIdTranslations || {},
    description: warmupData?.description || '',
    descriptionTranslations: warmupData?.descriptionTranslations || {},
    equipments: warmupData?.equipments || [],
    length: warmupData?.length || 0,
    thumbnail: warmupData?.thumbnail,
    videoThumbnail: warmupData?.videoThumbnail,
    deleteThumbnail: false,
    deletevideoThumbnail: false
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
      imageFields: [],
    });
    const payload = {
      ...values, ...translations
    }
    mutate({ warmupId, payload });
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Warmup"
        submitButton={
          <Button form="update-warmup" variant='danger' type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="update-warmup" onSubmit={formik.handleSubmit}>
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
              onDelete={() => formik.setValues({ ...formik.values, thumbnail: '', deleteThumbnail: true })}
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
              onDelete={() => formik.setValues({ ...formik.values, videoThumbnail: '', deletevideoThumbnail: true })}
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
