import { Field, Textarea, Dropzone } from '@/components/Form';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';

interface FormikState {
  description: string;
  vimeoId: string;
  thumbnail: any;
  deleteImage: boolean;
}

export const DayDetail = ({ monthIndex, weekIndex, dayIndex, day, states, updateStates, isDisabled, updateDay }) => {
  useEffect(() => {
    if (day.formats) {
      const newCheckedStates = ['3', '4', '5'].map((format) => day.formats.includes(format));
      updateStates(newCheckedStates);
    }
  }, [day.formats]);

  const handleCheckboxClick = (index: number) => {
    const newCheckedStates = states.map((state, i) => (i === index ? !state : state));
    updateStates(newCheckedStates);

    const newFormats = newCheckedStates.reduce((formats, state, i) => {
      if (state) formats.push(['3', '4', '5'][i]);
      return formats;
    }, []);

    const updatedDay = {
      ...day,
      formats: newFormats,
    };
    updateDay(monthIndex, weekIndex, dayIndex, updatedDay);
  };

  const initialValues: FormikState = {
    description: day.description,
    vimeoId: day.vimeoId,
    thumbnail: day.thumbnail,
    deleteImage: false,
  };

  const formik = useFormik({
    initialValues,
    validationSchema: null,
    onSubmit: (v) => console.log('submit'),
  });

  useEffect(() => {
    const updatedDay = {
      ...day,
      description: formik.values.description,
      vimeoId: formik.values.vimeoId,
      thumbnail: formik.values.thumbnail,
    };
    updateDay(monthIndex, weekIndex, dayIndex, updatedDay);
  }, [formik.values]);

  return (
    <div className="mb-4 flex mt-[25px]">
      <div className="w-1/2">
        <Textarea label="Description" formik={formik} name="description" placeholder='Description'/>
      </div>
      <div className="w-1/2 ml-4 mr-4">
        <Dropzone
          label="Thumbnail"
          name="image"
          formik={formik}
          defaultImg={formik.values.thumbnail}
          onDrop={(img) => formik.setFieldValue('thumbnail', img)}
          onDelete={() => formik.setValues({ ...formik.values, thumbnail: '', deleteImage: true })}
          file={day.thumbnail}
        />
        <Field label="Vimeo Id" formik={formik} name="vimeoId" />
        <div className="flex">
          <div className="flex items-center">
            <label className="block mb-1 mr-4">Available in variations:</label>
          </div>
          <div className="flex gap-3">
              {['3', '4', '5'].map((label, index) => (
                <div
                  key={index}
                  onClick={() => !isDisabled(index) && handleCheckboxClick(index)}
                  className={`flex items-center justify-center w-10 h-10 border cursor-pointer transition-colors 
                  ${
                    isDisabled(index)
                      ? 'bg-gray-300 border-gray-400 cursor-not-allowed opacity-60'
                      : ''
                  }
                  `}
                  style={
                    states[index]
                      ? { backgroundColor: '#00A89E' }
                      : { backgroundColor: '#FFFFFF' }
                  }
                >
                  <span
                    className={`text-md font-medium ${
                      states[index] ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
