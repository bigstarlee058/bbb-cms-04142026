import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { Field, FormDrawer, Dropzone, Textarea, Select } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation } from 'react-query';
import { updateSection } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createSectionSchema } from '@/utils/yup';
import { TextareaWithFormatting } from '@/components/Form/TextareaWithFormatting';

interface FormikState {
  title: string;
  description: string;
  vimeoId: string;
  variations: string[];
  formats: string[];
}

export const UpdateSection = ({ sectionId, sections }) => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(updateSection, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message
      });
    }
  });

  const sectionData = sections.sections.find((ex) => ex._id === sectionId);

  const initialValues: FormikState = {
    title: sectionData?.title || '',
    description: sectionData?.description || '',
    vimeoId: sectionData?.vimeoId || '',
    variations: sectionData?.variations || [],
    formats: sectionData?.formats || [],
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createSectionSchema,
    onSubmit: (v) => onSubmit(v)
  });
  const onSubmit = (state: FormikState) => {
    const { title, description, vimeoId, variations, formats } = state;
    console.log("sumit")
    mutate({ sectionId, title, description, vimeoId, variations, formats });
  };
  const handleVariationCheckboxClick = (label: string, index:number) => {
    const currentValues = formik.values.variations;
    let newValues;

    if (currentValues.includes(label)) {
      // Remove the label
      newValues = currentValues.filter((item) => item !== label);
    } else {
      // Add the label
      newValues = [...currentValues, label];
    }

    // Sort the newValues array in ascending numerical order
    newValues.sort((a, b) => Number(a) - Number(b));
    formik.setFieldValue('variations', newValues);
  };
  const handleFormatCheckboxClick = (label: string, index:number) => {
    const currentFormats = formik.values.formats;
    let newFormats;

    if (currentFormats.includes(label)) {
      // Remove the label
      newFormats = currentFormats.filter((item) => item !== label);
    } else {
      // Add the label
      newFormats = [...currentFormats, label];
    }

    // Sort the newValues array in ascending numerical order
    newFormats.sort();
    formik.setFieldValue('formats', newFormats);
  };
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Section"
        submitButton={
          <Button form="update-section" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-section" onSubmit={formik.handleSubmit}>
          <Field label="Name" formik={formik} name="title" />
          <TextareaWithFormatting label="Description" formik={formik} name="description" />
          {/* <Textarea label="Description" formik={formik} name="description" /> */}
          <Field label="Vimeo Id" formik={formik} name="vimeoId" />
          <div className="flex mt-3">
            <div className="flex items-center">
              <label className="block mb-1 mr-4">Available in variations:</label>
            </div>
            <div className="flex gap-3">
              {['3', '4', '5'].map((label, index) => (
                <div
                  key={index}
                  onClick={() => handleVariationCheckboxClick(label, index)}
                  className={`flex items-center justify-center w-10 h-10 border cursor-pointer transition-colors`}
                  style={formik.values.variations.includes(label) ? { backgroundColor: '#00A89E' } : { backgroundColor: '#FFFFFF' }}
                >
                  <span className={`text-md font-medium ${formik.values.variations.includes(label) ? 'text-white' : 'text-gray-800'}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex mt-3">
            <div className="flex items-center">
              <label className="block mb-1 mr-4">Available in formats:</label>
            </div>
            <div className="flex gap-3">
              {['A', 'B', 'C'].map((label, index) => (
                <div
                  key={index}
                  onClick={() => handleFormatCheckboxClick(label, index)}
                  className={`flex items-center justify-center w-10 h-10 border cursor-pointer transition-colors`}
                  style={formik.values.formats.includes(label) ? { backgroundColor: '#00A89E' } : { backgroundColor: '#FFFFFF' }}
                >
                  <span className={`text-md font-medium ${formik.values.formats.includes(label) ? 'text-white' : 'text-gray-800'}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </form>
      </FormDrawer>
    </Authorization>
  );
};
