import React, { useState } from 'react';
import { Button } from '@/components/Elements';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

interface DateRangePickerProps {
  onSelectRange: (range: DateRange) => void;
  hideDatePicker: () => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ onSelectRange, hideDatePicker }) => {
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

  const handleResetClick = () => {
    setSelectedRange(undefined);
    onSelectRange({ from: undefined, to: undefined });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'from' | 'to') => {
    const date = new Date(e.target.value);
    if (isNaN(date.getTime())) return;

    setSelectedRange((prev) => {
      const newRange = {
        ...prev,
        [field]: date,
      };
      onSelectRange(newRange as DateRange);
      return newRange as DateRange;
    });
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
              value={selectedRange?.from ? selectedRange.from.toISOString().split('T')[0] : ''} 
              onChange={(e) => handleInputChange(e, 'from')} 
            />
            <input 
              type="date" 
              className="border border-gray-300 px-2 py-1 rounded-md" 
              value={selectedRange?.to ? selectedRange.to.toISOString().split('T')[0] : ''} 
              onChange={(e) => handleInputChange(e, 'to')} 
            />
          </div>
        </div>
      </div>
      <DayPicker
        selected={selectedRange}
        onDayClick={handleDayClick}
        numberOfMonths={2}
        mode="range"
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
