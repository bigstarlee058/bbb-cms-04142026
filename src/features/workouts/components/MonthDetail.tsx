import { Field, Textarea, Dropzone } from '@/components/Form';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import DateRangePicker from './DateRangePicker';

Modal.setAppElement('#root'); // Set root element for accessibility

export const MonthDetail = ({ monthIndex, month, updateMonth }) => {
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(month.startDate);
  const [endDate, setEndDate] = useState<Date | undefined>(month.endDate);

  const updateMonthDates = (range) => {
    setStartDate(range.from);
    setEndDate(range.to);
    const updatedMonth = { ...month, startDate: range.from, endDate: range.to };
    updateMonth(monthIndex, updatedMonth);
  };

  const openDatePickerModal = () => {
    setShowDatePickerModal(true);
  };

  const closeDatePickerModal = () => {
    setShowDatePickerModal(false);
  };

  const formik = useFormik({
    initialValues : month,
    validationSchema: null,
    onSubmit: () => {},
  });
  console.log(monthIndex);
  console.log(month);
  useEffect(() => {
    if(month._id === ""){
      formik.setFieldValue('description', month.description);
      formik.setFieldValue('vimeoId', month.vimeoId);

      setStartDate(month.startDate);
      setStartDate(month.endDate);
    }
  },[month]);

  useEffect(() => {
    const updatedMonth = {
      ...month,
      description: formik.values.description,
      vimeoId: formik.values.vimeoId,
      thumbnail: formik.values.thumbnail,
    };
    updateMonth(monthIndex, updatedMonth);
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
          file={month.thumbnail}
        />
        <Field label="Vimeo Id" formik={formik} name="vimeoId" />
        <div className="flex flex-col mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <input
                type="text"
                value={startDate ? new Date(startDate).toLocaleDateString() : ''}
                readOnly
                className="mr-2 p-2 border rounded"
                placeholder="Start Date"
                onClick={openDatePickerModal}
              />
              <input
                type="text"
                value={endDate ? new Date(endDate).toLocaleDateString() : ''}
                readOnly
                className="p-2 border rounded"
                placeholder="End Date"
                onClick={openDatePickerModal}
              />
            </div>
          </div>
          <Modal
            isOpen={showDatePickerModal}
            onRequestClose={closeDatePickerModal}
            contentLabel="Select Date Range"
            className="modal-content"
            overlayClassName="modal-overlay"
          >
            <DateRangePicker
              onSelectRange={updateMonthDates}
              hideDatePicker={closeDatePickerModal}
            />
          </Modal>
        </div>
      </div>
    </div>
  );
};
