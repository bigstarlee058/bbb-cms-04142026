import { useNotificationStore } from '@/stores/notifications';
import { Field, Dropzone, Textarea, Select } from './custom';
import { useEffect } from 'react';
import { SelectOption } from '@/types';

const DAY_ORDERS: SelectOption[] = [
  {
    label: 'Day 1',
    value: '1'
  },
  {
    label: 'Day 2',
    value: '2'
  },
  {
    label: 'Day 3',
    value: '3'
  },
  {
    label: 'Day 4',
    value: '4'
  },
  {
    label: 'Day 5',
    value: '5'
  },
  {
    label: 'Day 6',
    value: '6'
  },
  {
    label: 'Day 7',
    value: '7'
  }
];

export const DayDetail = ({
  monthIndex,
  weekIndex,
  dayIndex,
  week,
  day,
  states,
  updateStates,
  updateDay,
  isPumpDay = false,
  days = []
}) => {
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (day.formats) {
      const newCheckedStates = ['3', '4', '5'].map((format) => day.formats.includes(format));
      updateStates(newCheckedStates);
    }
  }, [day.formats]);

  const handleCheckboxClick = (index: number) => {
    let existingCnt = 0;
    if (isPumpDay) {
      days.forEach((day) => {
        const formats = Array.isArray(day.formats) ? day.formats : [];
        if (formats.includes(['3', '4', '5'][index])) existingCnt++;
      });
    } else {
      week.days.forEach((day) => {
        if (day.formats.includes(['3', '4', '5'][index])) existingCnt++;
      });
    }

    if (existingCnt >= parseInt(['3', '4', '5'][index]) && states[index] === false) {
      addNotification({
        type: 'warning',
        title: `There're already days that have split${['3', '4', '5'][index]}`
      });
      return;
    }
    const newCheckedStates = states.map((state, i) => (i === index ? !state : state));
    updateStates(newCheckedStates);

    const newFormats = newCheckedStates.reduce((formats, state, i) => {
      if (state) formats.push(['3', '4', '5'][i]);
      return formats;
    }, []);
    updateDayDetail('formats', newFormats);
  };

  const updateDayDetail = (key, value) => {
    const updatedDay = { ...day, [key]: value };
    updateDay(monthIndex, weekIndex, dayIndex, updatedDay);
  };

  const handleChange = (key, value) => {
    updateDayDetail(key, value);
  };

  return (
    <div className="mb-4 flex mt-[25px]">
      <div className="w-1/2">
        <Textarea label="Description" name="description" value={day.description} onChange={handleChange} hasHeight = {true} />
      </div>
      <div className="w-1/2 ml-4 mr-4 mt-6">
        <Dropzone
          defaultImg={day.thumbnail}
          onDrop={(img) => {
            handleChange('thumbnail', img);
          }}
          onDelete={() => {
            handleChange('thumbnail', null);
          }}
          file={day.thumbnail}
        />
        <Field label="Vimeo Id One" name="vimeoId" value={day.vimeoId} onChange={handleChange} />
        <Field label="Vimeo Id Two" name="vimeoIdTwo" value={day.vimeoIdTwo} onChange={handleChange} />
        <Field label="Vimeo Id Three" name="vimeoIdThree" value={day.vimeoIdThree} onChange={handleChange} />
        {!isPumpDay && (
          <Select
            label="Day Order"
            options={DAY_ORDERS}
            value={{ label: `Day ${day.typeId}`, value: day.typeId }}
            className="w-[300px]"
            onChange={({ value }: SelectOption) => {
              if (parseInt(value) !== day.typeId) {
                updateDayDetail('typeId', parseInt(value));
              }
            }}
          />
        )}

        <div className="flex mt-3">
          <div className="flex items-center">
            <label className="block mb-1 mr-4">Available in variations:</label>
          </div>
          <div className="flex gap-3">
            {['3', '4', '5'].map((label, index) => (
              <div
                key={index}
                onClick={() => handleCheckboxClick(index)}
                className={`flex items-center justify-center w-10 h-10 border cursor-pointer transition-colors`}
                style={states[index] ? { backgroundColor: '#00A89E' } : { backgroundColor: '#FFFFFF' }}
              >
                <span className={`text-md font-medium ${states[index] ? 'text-white' : 'text-gray-800'}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
