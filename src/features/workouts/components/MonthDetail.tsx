import React, { useEffect } from 'react';
import { Field, Textarea, Dropzone } from './custom';
import { useState } from 'react';
import { Month } from '@/types';
import { DateRangePicker } from './custom';
import Modal from 'react-modal';

import { axios } from '@/lib/axios';
import { useMonthCoverContext } from '../MonthCoverContext';
Modal.setAppElement('#root');

interface Props {
  monthIndex: number;
  month: Month;
  updateMonth: (monthIndex: Number, updatedMonth: Month) => void;
}

export const MonthDetail = React.memo(({ monthIndex, month, updateMonth }: Props) => {
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(month.startDate);
  const [endDate, setEndDate] = useState<Date | undefined>(month.endDate);

  const { count } = useMonthCoverContext();

  useEffect(() => {
    if (count > 0) {
      axios.get(`/settings/admin/get`).then((result) => updateMonthDetail('thumbnail', result[0].monthCover));
    }
  }, [count]);

  const updateMonthDates = (range) => {
    setStartDate(range.from);
    setEndDate(range.to);
    const updatedMonth = { ...month, startDate: range.from, endDate: range.to };
    updateMonth(monthIndex, updatedMonth);
  };

  const updateMonthDetail = (key, value) => {
    const updatedMonth = { ...month, [key]: value };
    updateMonth(monthIndex, updatedMonth);
  };
  const handleChange = (key, value) => {
    updateMonthDetail(key, value);
  };

  const openDatePickerModal = () => {
    setShowDatePickerModal(true);
  };

  const closeDatePickerModal = () => {
    setShowDatePickerModal(false);
  };

  return (
    <div className="mb-4 flex mt-[25px]">
      <div className="w-1/2 my-auto">
        <Dropzone
          defaultImg={month.thumbnail}
          onDrop={(img) => {
            handleChange('thumbnail', img);
          }}
          onDelete={() => {
            handleChange('thumbnail', null);
          }}
          file={month.thumbnail}
        />
      </div>
      <div className="w-1/2 ml-4 mr-4">
        <Field label="Vimeo Id" name="vimeoId" value={month.vimeoId} onChange={handleChange} />
        <div className="flex flex-col mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-4">
              <Field
                label="Start Date"
                name="startDate"
                value={startDate ? new Date(startDate).toLocaleDateString() : ''}
                onChange={handleChange}
                onClick={openDatePickerModal}
                readOnly
              />
              <Field
                label="End Date"
                name="endDate"
                disabled
                value={endDate ? new Date(endDate).toLocaleDateString() : ''}
                onChange={handleChange}
                onClick={openDatePickerModal}
                readOnly
              />
            </div>
          </div>
          <Modal
            isOpen={showDatePickerModal}
            onRequestClose={closeDatePickerModal}
            contentLabel="Select Date Range"
            className="modal-content custom-modal-content"
            overlayClassName="modal-overlay"
          >
            <DateRangePicker onSelectRange={updateMonthDates} hideDatePicker={closeDatePickerModal} />
          </Modal>
        </div>
      </div>
    </div>
  );
});
