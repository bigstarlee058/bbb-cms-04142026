import { Field, Textarea, Dropzone } from '@/components/Form';
import { useFormik } from 'formik';
import { useEffect } from 'react';

export const WeekDetail = ({ monthIndex, weekIndex, week, updateWeek }) => {

  const formik = useFormik({
    initialValues: week,
    validationSchema: null,
    onSubmit: (v) => console.log('submit'),
  });
  
  useEffect(() => {
    formik.setFieldValue('description', week.description);
    formik.setFieldValue('vimeoId', week.vimeoId);
  },[week]);

  useEffect(() => {
    const updatedWeek = {
      ...week,
      description: formik.values.description,
      vimeoId: formik.values.vimeoId,
      thumbnail: formik.values.thumbnail,
    };
    updateWeek(monthIndex, weekIndex, updatedWeek);
  }, [formik.values]);

  return (
    <div className="mb-4 flex mt-[25px]">
      <div className="w-1/2">
        <Textarea
          label="Description"
          formik={formik}
          name="description"
          placeholder="Description"
        />
      </div>
      <div className="w-1/2 ml-4 mr-4">
        <Dropzone
          label="Thumbnail"
          name="image"
          formik={formik}
          defaultImg={formik.values.thumbnail}
          onDrop={(img) => formik.setFieldValue('thumbnail', img)}
          onDelete={() => formik.setValues({ ...formik.values, thumbnail: '', deleteImage: true })}
          file={week.thumbnail}
        />
        <Field label="Vimeo Id" formik={formik} name="vimeoId" />
      </div>
    </div>
  );
};
