import { useEffect } from 'react';
import { PencilIcon } from '@heroicons/react/solid';
import { useFormik } from 'formik';
import { useMutation, useQuery } from 'react-query';
import { Button } from '@/components/Elements';
import { FormDrawer } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { updateDownload } from '../api';
import { fetchLanguages } from '@/lib/api';
import { useLanguageStore } from '@/stores/languages';
import { LanguageSelector } from '@/components/Language/LanguageSelector';
import { useTranslations } from '@/hooks/useTranslations';
import { TranslatableInput } from '@/components/Form/TranslatableInput';
import { TranslatableTextarea } from '@/components/Form/TranslatableTextarea';
import { TranslatablePdfDropzone } from "@/components/Form/TranslatablePdfDropZone";
import { prepareTranslations } from '@/utils/translationHelper';
import * as Yup from 'yup';
import { fetchWorkouts } from '@/features/workouts/api';
import ReactSelect, { SingleValue } from 'react-select';
import reactSelectStylesConfig from '@/lib/react-select';
type WorkoutOption = {
  value: string;
  label: string;
};
interface FormikState {
  title: string;
  titleTranslations: Record<string, string>;
  description: string;
  descriptionTranslations: Record<string, string>;
  pdf: any;
  pdfTranslations: Record<string, any>;
  deletePdf: boolean;
  releaseDate: string;
  monthId: string;
}

const updateDownloadSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  releaseDate: Yup.string().required('Release date is required'),
  monthId: Yup.string().required('Select a Month'),
});

export const UpdateDownload = ({ downloadId, downloads }: { downloadId: string; downloads: any }) => {
  const { addNotification } = useNotificationStore();
  const { data: fetchedLanguages = [] } = useQuery('languages', fetchLanguages);
  const setLanguages = useLanguageStore((state) => state.setLanguages);
  const downloadData = downloads?.downloads?.find((d: any) => d._id === downloadId);

  const {
    selectedLanguages,
    handleLanguageToggle,
    getFilteredTranslations,
    resetLanguages,
    setSelectedLanguages,
  } = useTranslations({
    translationFields: ['title', 'description', 'pdf'],
  });

  useEffect(() => {
    if (fetchedLanguages.length > 0) {
      setLanguages(fetchedLanguages);
    }
  }, [fetchedLanguages, setLanguages]);

  const syncLanguages = () => {
    const apiLanguages = fetchedLanguages.map((l) => l.key);
    const foundLangs = Object.values(downloadData || {})
      .flatMap((obj) => (obj && typeof obj === 'object' ? Object.keys(obj) : []))
      .filter((key) => apiLanguages.includes(key));

    if (foundLangs.length > 0) setSelectedLanguages([...new Set(foundLangs)]);
    else resetLanguages();
  };

  useEffect(() => {
    syncLanguages();
  }, [downloadData, fetchedLanguages]);
  const { data: workoutsData, isLoading: workoutsLoading } = useQuery(
    ['get-workouts'],
    () => fetchWorkouts({ page: 1, perPage: 1000 })
  );
  const { mutate, isLoading, isSuccess } = useMutation(updateDownload, {
    onSuccess: (message: string) => {
      addNotification({ type: 'success', title: message });
    },
  });

  const initialValues: FormikState = {
    title: downloadData?.title ?? '',
    titleTranslations: downloadData?.titleTranslations ?? {},
    description: downloadData?.description ?? '',
    descriptionTranslations: downloadData?.descriptionTranslations ?? {},
    pdf: downloadData?.pdf ?? '',
    pdfTranslations: downloadData?.pdfTranslations ?? {},
    deletePdf: false,
    releaseDate: downloadData?.releaseDate ?? '',
    monthId: downloadData?.monthId ?? '',

  };

  const onSubmit = (values: FormikState) => {
    const translations = prepareTranslations({
      values,
      translations: getFilteredTranslations(values, true),
      selectedLanguages,
      textFields: ['title', 'description'],
      imageFields: ['pdf'],
    });
    const payload = { ...values, ...translations };
    mutate({ downloadId, ...payload });
  };
  const formatDateRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startMonth = start.getMonth() + 1;
    const startDay = start.getDate();
    const endMonth = end.getMonth() + 1;
    const endDay = end.getDate();
    const year = end.getFullYear();

    return `${startMonth}/${startDay} - ${endMonth}/${endDay}, ${year}`;
  };

  const workoutOptions: WorkoutOption[] = (workoutsData?.months || [])
    .slice()
    .sort((a: any, b: any) =>
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )
    .map((workout: any) => ({
      value: workout._id,
      label: `Month ${workout.index} | ${workout.title} | ${formatDateRange(workout.startDate, workout.endDate)}`,
    }));

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: updateDownloadSchema,
    onSubmit,
  });
  const selectedWorkoutOption = workoutOptions.find(
    (opt) => opt.value === formik.values.monthId
  ) || null;
  const isoToLocalInput = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

  const localInputToIso = (localString: string) => {
    if (!localString) return '';
    return new Date(localString).toISOString();
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Download"
        submitButton={
          <Button form="update-download" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onToggle={handleLanguageToggle}
        />
        <form id="update-download" onSubmit={formik.handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select a Month
            </label>
            <ReactSelect<WorkoutOption>
              styles={reactSelectStylesConfig}
              className="w-full"
              placeholder="Select a month"
              name="monthId"
              options={workoutOptions}
              value={selectedWorkoutOption}
              onChange={(option: SingleValue<WorkoutOption>) =>
                formik.setFieldValue('monthId', option?.value || '')
              }
              isLoading={workoutsLoading}
              isClearable
            />
            {formik.touched.monthId && formik.errors.monthId && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.monthId}</p>
            )}
          </div>
          <TranslatableInput
            formik={formik}
            name="title"
            translationField="titleTranslations"
            label="Title"
            selectedLanguages={selectedLanguages}
          />
          <TranslatableTextarea
            formik={formik}
            name="description"
            translationField="descriptionTranslations"
            label="Description"
            selectedLanguages={selectedLanguages}
          />
          <TranslatablePdfDropzone
            formik={formik}
            name="pdf"
            translationField="pdfTranslations"
            label="PDF File"
            selectedLanguages={selectedLanguages}
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Release Date
            </label>
            <input
              type="datetime-local"
              value={isoToLocalInput(formik.values.releaseDate)}
              onChange={(e) => formik.setFieldValue('releaseDate', localInputToIso(e.target.value))}
              className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {formik.touched.releaseDate && formik.errors.releaseDate && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.releaseDate}</p>
            )}
          </div>
        </form>
      </FormDrawer>
    </Authorization >
  );
};