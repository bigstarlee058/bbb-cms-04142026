import { useNotificationStore } from '@/stores/notifications';
import { Field, Dropzone, Textarea, Select } from './custom';
import { WorkoutTranslatableInput } from './custom/WorkoutTranslatableInput';
import { WorkoutTranslatableTextarea } from './custom/WorkoutTranslatableTextarea';
import { useEffect } from 'react';
import { SelectOption } from '@/types';
import { WorkoutTranslatableDropzone } from './custom/WorkoutTranslatableDropzone';
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
  days = [],
  selectedLanguages=[]
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
    const keys = key.split('.');
    let updatedDay = { ...day };
    
    if (keys.length === 1) {
      updatedDay = { ...day, [key]: value };
    } else {
      updatedDay = {
        ...day,
        [keys[0]]: { ...day[keys[0]], [keys[1]]: value }
      };
    }
    updateDay(monthIndex, weekIndex, dayIndex, updatedDay);
  };

  const handleChange = (key, value) => {
    updateDayDetail(key, value);
  };

  return (
    <div className="mb-4 flex mt-[25px]">
      <div className="w-1/2">
        <WorkoutTranslatableTextarea
          name="description"
          translationField="descriptionTranslations"
          label="Description"
          selectedLanguages={selectedLanguages}
          value={day.description || ''}
          translations={day.descriptionTranslations || {}}
          onChange={handleChange}
          hasHeight={isPumpDay ? false : true}
        />
      </div>
      <div className="w-1/2 ml-4 mr-4 ">
        <div>
          <WorkoutTranslatableDropzone
            name="thumbnail"
            label="Thumbnail"
            selectedLanguages={selectedLanguages}
            value={day.thumbnail}
            translations={day.thumbnailTranslations || {}}
            onChange={handleChange}
            onDelete={(key) => {
              handleChange(key, null);
            }}
          />
        </div>

        <div className='mt-2'>
          <WorkoutTranslatableInput
            name="vimeoId"
            translationField="vimeoIdTranslations"
            label="Vimeo Id One"
            selectedLanguages={selectedLanguages}
            value={day.vimeoId || ''}
            translations={day.vimeoIdTranslations || {}}
            onChange={handleChange}
          />
        </div>

        <div className='mt-4'>
          <WorkoutTranslatableDropzone
            name="thumbnailOne"
            label="Thumbnail One"
            selectedLanguages={selectedLanguages}
            value={day.thumbnailOne}
            translations={day.thumbnailOneTranslations || {}}
            onChange={handleChange}
            onDelete={(key) => {
              handleChange(key, null);
            }}
          />
        </div>
        {!isPumpDay && (
          <WorkoutTranslatableInput
            name="vimeoIdTwo"
            translationField="vimeoIdTwoTranslations"
            label="Vimeo Id Two"
            selectedLanguages={selectedLanguages}
            value={day.vimeoIdTwo || ''}
            translations={day.vimeoIdTwoTranslations || {}}
            onChange={handleChange}
          />
        )}
        {!isPumpDay && (
          <div className='mt-2 mb-2'>
          <WorkoutTranslatableDropzone
            name="thumbnailTwo"
            label="Thumbnail Two"
            selectedLanguages={selectedLanguages}
            value={day.thumbnailTwo}
            translations={day.thumbnailTwoTranslations || {}}
            onChange={handleChange}
            onDelete={(key) => {
              handleChange(key, null);
            }}
          />
        </div>
        )}
        {!isPumpDay && (
          <div className='mb-4'>
          <WorkoutTranslatableInput
            name="vimeoIdThree"
            translationField="vimeoIdThreeTranslations"
            label="Vimeo Id Three"
            selectedLanguages={selectedLanguages}
            value={day.vimeoIdThree || ''}
            translations={day.vimeoIdThreeTranslations || {}}
            onChange={handleChange}
          />
          </div>
        )}
        {!isPumpDay && (
          <div className='mt-2 mb-2'>
          <WorkoutTranslatableDropzone
            name="thumbnailThree"
            label="Thumbnail Three"
            selectedLanguages={selectedLanguages}
            value={day.thumbnailThree}
            translations={day.thumbnailThreeTranslations || {}}
            onChange={handleChange}
            onDelete={(key) => {
              handleChange(key, null);
            }}
          />
        </div>
        )}
        {!isPumpDay && (
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
        )}
      </div>
    </div>
  );
};