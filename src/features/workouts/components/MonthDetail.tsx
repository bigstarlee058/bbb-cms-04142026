import React, { useEffect } from 'react';
import { Field, Textarea, Dropzone } from './custom';
import { useState } from 'react';
import { Month } from '@/types';
import { DateRangePicker } from './custom';
import Modal from 'react-modal';
import { axios } from '@/lib/axios';
import { useMonthCoverContext } from '../MonthCoverContext';
import { WorkoutTranslatableInput } from './custom/WorkoutTranslatableInput';

Modal.setAppElement('#root');

interface Props {
  monthIndex: number;
  month: Month;
  updateMonth: (monthIndex: Number, updatedMonth: Month) => void;
  selectedLanguages: string[];
}

export const MonthDetail = React.memo(({ monthIndex, month, updateMonth, selectedLanguages }: Props) => {
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const parseDate = (date: any): Date | undefined => {
    if (!date) return undefined;
    const d = new Date(date);
    return isNaN(d.getTime()) ? undefined : d;
  };
  const formatDate = (date: Date | undefined): string => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${m}/${day}/${year}`;
  };

  const [startDate, setStartDate] = useState<Date | undefined>(parseDate(month.startDate));
  const [endDate, setEndDate] = useState<Date | undefined>(parseDate(month.endDate));

  useEffect(() => {
    setStartDate(parseDate(month.startDate));
    setEndDate(parseDate(month.endDate));
  }, [month.startDate, month.endDate]);
  const { count } = useMonthCoverContext();

  useEffect(() => {
    if (count > 0) {
      axios.get(`/settings/admin/get`).then((result) => updateMonthDetail('thumbnail', result[0].monthCover));
    }
  }, [count]);

  const updateMonthDates = (range) => {
    const normalizeDate = (date) => {
      if (!date) return undefined;
      const d = new Date(date);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
    };

    const from = normalizeDate(range.from);
    const to = normalizeDate(range.to);

    setStartDate(from);
    setEndDate(to);
    const updatedMonth = { ...month, startDate: from, endDate: to };
    updateMonth(monthIndex, updatedMonth);
  };

  const updateMonthDetail = (key, value) => {
    const keys = key.split('.');
    let updatedMonth = { ...month };

    if (keys.length === 1) {
      updatedMonth = { ...month, [key]: value };
    } else {
      updatedMonth = {
        ...month,
        [keys[0]]: { ...month[keys[0]], [keys[1]]: value }
      };
    }
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
      <div className="ml-2 mr-2">
        <WorkoutTranslatableInput
          name="vimeoId"
          translationField="vimeoIdTranslations"
          label="Vimeo Id"
          selectedLanguages={selectedLanguages}
          value={month.vimeoId || ''}
          translations={month.vimeoIdTranslations || {}}
          onChange={handleChange}
        />
        <div className="flex flex-col mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-4">
              <Field
                label="Start Date"
                name="startDate"
                value={formatDate(startDate)}
                onChange={handleChange}
                onClick={openDatePickerModal}
                readOnly
              />
              <Field
                label="End Date"
                name="endDate"
                disabled
                value={formatDate(endDate)}
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