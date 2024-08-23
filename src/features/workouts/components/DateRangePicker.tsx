import React, { useState } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

interface DateRangePickerProps {
  onSelectRange: (range: DateRange) => void;
  hideDatePicker: () => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ onSelectRange, hideDatePicker }) => {
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined);

  const handleDayClick = (day: Date) => {
    setSelectedRange((prev: DateRange | undefined) => {
      const newRange = {
        from: prev?.from ?? day,
        to: day,
      };
      onSelectRange(newRange);
      return newRange;
    });
  };

  const handleDoneClick = () => {
    hideDatePicker();
  };

  return (
    <div className="date-range-picker">
      <DayPicker
        selected={selectedRange}
        onDayClick={handleDayClick}
        numberOfMonths={2}
        mode="range"
      />
      <div className="flex justify-end mt-2">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleDoneClick}
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default DateRangePicker;