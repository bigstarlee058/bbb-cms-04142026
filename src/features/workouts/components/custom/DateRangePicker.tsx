import React, { useState } from 'react';
import { Button } from '@/components/Elements';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

interface DateRangePickerProps {
  onSelectRange: (range: DateRange) => void;
  hideDatePicker: () => void;
}

const getToDate = (from: Date, toDays: number) => {
  const to = new Date(from);
  to.setDate(to.getDate() + toDays);
  return to;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ onSelectRange, hideDatePicker }) => {
  const [selectedFrom, setSelectedFrom] = useState<Date | undefined>(undefined);

  const handleDayClick = (day: Date) => {
    const newRange = {
      from: day,
      to: getToDate(day, 29),
    };
    onSelectRange(newRange);
    setSelectedFrom(day)
  };

  const handleDoneClick = () => {
    hideDatePicker();
  };

  const handleResetClick = () => {
    setSelectedFrom(undefined);
    onSelectRange({ from: undefined, to: undefined });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputDate = e.target.value as string;
    const date = new Date(inputDate + 'T00:00:00');
    if (isNaN(date.getTime())) return;
    setSelectedFrom(date)
    const newRange = {
      from: date,
      to: getToDate(date, 29),
    };
    onSelectRange(newRange as DateRange);
  };

  return (
    <div className="date-range-picker">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button 
            className="text-sm text-blue-600" 
            onClick={handleResetClick}
          >
            Reset
          </button>
          <div className="flex items-center space-x-2">
            <input 
              type="date" 
              className="border border-gray-300 px-2 py-1 rounded-md" 
              value={selectedFrom ? selectedFrom.toISOString().split('T')[0] : ''} 
              onChange={handleInputChange} 
            />
          </div>
        </div>
      </div>
      <DayPicker
        selected={selectedFrom}
        onSelect={handleDayClick}
        numberOfMonths={1}
        mode="single"
      />
      <div className="flex justify-end mt-2">
        <Button
          variant="danger"
          onClick={handleDoneClick}
        >
          Done
        </Button>
      </div>
    </div>
  );
};
