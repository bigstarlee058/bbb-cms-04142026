import { Button } from '@/components/Elements';
import { DuplicateIcon, PlusIcon } from '@heroicons/react/outline';
import { TitleResponse } from '@/types';
import { CustomTitle } from './CustomTitle';
import { Select, DeleteConfirmation } from './custom';
import { WorkoutTranslatableInput } from './custom/WorkoutTranslatableInput';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { fetchWarmupTitles } from '../api';
import _ from 'lodash';

export const WarmupPlan = ({
  monthIndex,
  weekIndex,
  dayIndex,
  warmupIndex,
  warmup,
  addWarmup,
  reassignWarmupTypeIds,
  months,
  updateMonths,
  isPumpDay = false,
  updateDays = (val) => {},
  days = [],
  selectedLanguages=[]
}) => {
  const [checkedStates, setCheckedStates] = useState([false, false, false]);

  const { data: titles, isLoading } = useQuery('get-warmup-titles', () => fetchWarmupTitles({ filterString: '' }));
  
  useEffect(() => {
    if (warmup.formats) {
      const newCheckedStates = ['A', 'B', 'C'].map((format) => warmup.formats.includes(format));
      setCheckedStates(newCheckedStates);
    }
  }, [warmup.formats]);

  const updateWarmup = (monthIndex, weekIndex, dayIndex, warmupIndex, updatedWarmup) => {
    if (isPumpDay) {
      const updatedDays = [...days];
      updatedDays[dayIndex].warmups[warmupIndex] = updatedWarmup;
      updateDays(updatedDays);
    } else {
      const updatedMonths = [...months];
      updatedMonths[monthIndex].weeks[weekIndex].days[dayIndex].warmups[warmupIndex] = updatedWarmup;
      updateMonths(updatedMonths, { skipMeasure: true })
    }
  };

  const duplicateWarmup = (monthIndex, weekIndex, dayIndex, warmupIndex) => {
    const originWarmup = months[monthIndex].weeks[weekIndex].days[dayIndex].warmups[warmupIndex];
    const newWarmup = { ..._.cloneDeep(originWarmup), formats: [] };
    const nextFormat = getNextFormat();
    const nextTypeId = getNextTypeId();
    if (isPumpDay) {
      const updatedDays = [...days];
      if (!nextFormat) {
        newWarmup.typeId = nextTypeId;
        updatedDays[dayIndex].warmups.push(newWarmup);
      } else updatedDays[dayIndex].warmups.splice(warmupIndex + 1, 0, newWarmup);
      updateDays(updatedDays);
    } else {
      const updatedMonths = [...months];
      if (!nextFormat) {
        newWarmup.typeId = nextTypeId;
        updatedMonths[monthIndex].weeks[weekIndex].days[dayIndex].warmups.push(newWarmup);
      } else updatedMonths[monthIndex].weeks[weekIndex].days[dayIndex].warmups.splice(warmupIndex + 1, 0, newWarmup);
      updateMonths(updatedMonths, { skipMeasure: true })
    }
  };

  const deleteWarmup = (monthIndex, weekIndex, dayIndex, warmupIndex) => {
    if (isPumpDay) {
      const updatedDays = [...days];
      const countSameType = updatedDays[dayIndex].warmups.filter((e) => e.typeId === warmup.typeId).length;
      updatedDays[dayIndex].warmups.splice(warmupIndex, 1);
      updateDays(updatedDays);
      if (countSameType === 1) reassignWarmupTypeIds(warmup.typeId);
    } else {
      const updatedMonths = [...months];
      const countSameType = updatedMonths[monthIndex].weeks[weekIndex].days[dayIndex].warmups.filter(
        (e) => e.typeId === warmup.typeId
      ).length;
      updatedMonths[monthIndex].weeks[weekIndex].days[dayIndex].warmups.splice(warmupIndex, 1);
      updateMonths(updatedMonths, { skipMeasure: true })
      if (countSameType === 1) reassignWarmupTypeIds(warmup.typeId);
    }
  };

  const updateWarmupDetail = (key, value) => {
    const keys = key.split('.');
    let updatedWarmup = { ...warmup };
    
    if (keys.length === 1) {
      updatedWarmup = { ...warmup, [key]: value };
    } else {
      updatedWarmup = {
        ...warmup,
        [keys[0]]: { ...warmup[keys[0]], [keys[1]]: value }
      };
    }
    updateWarmup(monthIndex, weekIndex, dayIndex, warmupIndex, updatedWarmup);
  };

  const updateWarmupTitle = (_,title) => {
    const updatedWarmup = { ...warmup, title };
    updateWarmup(monthIndex, weekIndex, dayIndex, warmupIndex, updatedWarmup);
  };

  const handleCheckboxClick = (index) => {
    const newCheckedStates = checkedStates.map((state, i) => (i === index ? !state : state));
    setCheckedStates(newCheckedStates);

    const newFormats = newCheckedStates.reduce((formats, state, i) => {
      if (state) formats.push(['A', 'B', 'C'][i]);
      return formats;
    }, []);

    updateWarmupDetail('formats', newFormats);
  };

  const isDisabled = (index) => {
    const format = ['A', 'B', 'C'][index];
    if (isPumpDay) {
      return days[dayIndex].warmups
        .filter((e) => e !== warmup && e.typeId === warmup.typeId)
        .some((e) => e.formats?.includes(format));
    } else {
      return months[monthIndex].weeks[weekIndex].days[dayIndex].warmups
        .filter((e) => e !== warmup && e.typeId === warmup.typeId)
        .some((e) => e.formats?.includes(format));
    }
  };

  const handleChange = (key, value) => {
    updateWarmupDetail(key, value);
  };

  const getAddWarmupButtonTitle = () => {
    const allFormats = ['A', 'B', 'C'];
    const selectedFormats = checkedStates
      .map((isChecked, index) => (isChecked ? allFormats[index] : ''))
      .filter(Boolean);

    const availableFormats = allFormats.filter((format, index) => {
      return !selectedFormats.includes(format) && !isDisabled(index);
    });

    if (selectedFormats.length === 0 && availableFormats.length === 3) {
      const nextTypeId = getNextTypeId();
      return `Add Warmup ${nextTypeId}`;
    }

    const nextFormat = availableFormats.length > 0 ? availableFormats[0] : null;

    if (nextFormat) {
      return `Add Warmup ${warmup.typeId}${nextFormat}`;
    } else {
      const nextTypeId = getNextTypeId();
      return `Add Warmup ${nextTypeId}`;
    }
  };

  const getNextFormat = () => {
    const allFormats = ['A', 'B', 'C'];
    const selectedFormats = checkedStates
      .map((isChecked, index) => (isChecked ? allFormats[index] : ''))
      .filter(Boolean);

    const availableFormats = allFormats.filter((format, index) => {
      return !selectedFormats.includes(format) && !isDisabled(index);
    });

    return availableFormats.length > 0 && availableFormats.length < 3 ? availableFormats[0] : null;
  };

  const handleAddWarmupClick = () => {
    const nextFormat = getNextFormat();

    if (nextFormat) {
      addWarmup(monthIndex, weekIndex, dayIndex, warmup.typeId, [nextFormat]);
    } else {
      const nextTypeId = getNextTypeId();
      addWarmup(monthIndex, weekIndex, dayIndex, nextTypeId, []);
    }
  };

  const getNextTypeId = () => {
    let typeIds;
    if (isPumpDay) {
      typeIds = days[dayIndex].warmups.flatMap((warmup) => warmup.typeId);
    } else {
      typeIds = [...months][monthIndex].weeks[weekIndex].days[dayIndex].warmups.flatMap((warmup) => warmup.typeId);
    }

    const maxTypeId = Math.max(0, ...typeIds);
    return maxTypeId + 1;
  };

  return (
    <>
      <div
        className={`p-4 bg-gray-500 rounded shadow-md mt-4`}
        style={
          warmup.typeId === 1
            ? { backgroundColor: '#E0F67F' }
            : warmup.typeId === 2
            ? { backgroundColor: '#D4E96A' }
            : warmup.typeId === 3
            ? { backgroundColor: '#C0D45C' }
            : { backgroundColor: '#C0D45C' }
        }
      >
        <div className="flex mb-2 justify-between items-center">
          <CustomTitle
            type={'WARMUP'}
            index={warmup.typeId}
            customTitle={warmup?.title}
            titleTranslations={warmup?.titleTranslations || {}}
            selectedLanguages={selectedLanguages}
            updateFunction={handleChange}
          />
          <div className="flex gap-3">
            <Button
              variant="danger"
              name="duplicate warmup"
              startIcon={<DuplicateIcon className="h-4 w-4" />}
              onClick={() => duplicateWarmup(monthIndex, weekIndex, dayIndex, warmupIndex)}
            />
            <DeleteConfirmation
              deleteFunction={() => deleteWarmup(monthIndex, weekIndex, dayIndex, warmupIndex)}
              name={'Warmup'}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex">
            <div className="flex items-center">
              <label className="block mb-1 mr-4">Available in formats:</label>
            </div>
            <div className="flex gap-3 items-center">
              {['A', 'B', 'C'].map((label, index) => (
                <div
                  key={index}
                  onClick={() => !isDisabled(index) && handleCheckboxClick(index)}
                  className={`flex items-center justify-center w-10 h-10 border cursor-pointer transition-colors 
                  ${isDisabled(index) ? 'bg-gray-300 border-gray-400 cursor-not-allowed opacity-60' : ''}
                  `}
                  style={checkedStates[index] ? { backgroundColor: '#FFA89E' } : { backgroundColor: '#FFFFFF' }}
                >
                  <span className={`text-md font-medium ${checkedStates[index] ? 'text-white' : 'text-gray-800'}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Select
              label=""
              options={titles?.map(({ title, id }) => ({ label: title, id: id })) || []}
              value={titles?.map((title) => {
                if (title.id === warmup.warmupId) return { label: title?.title || '', value: title.id };
              })}
              isLoading={isLoading}
              onChange={(newValue: TitleResponse) => {
                handleChange('warmupId', newValue.id);
              }}
            />
          </div>
        </div>
        <div className='mt-3'> 
          <WorkoutTranslatableInput
            name="guide"
            translationField="guideTranslations"
            label="Guideline"
            selectedLanguages={selectedLanguages}
            value={warmup.guide || ''}
            translations={warmup.guideTranslations || {}}
            onChange={handleChange}
          />
        </div>
      </div>
      {(!isPumpDay && warmupIndex === months[monthIndex].weeks[weekIndex].days[dayIndex].warmups.length - 1) ||
      (isPumpDay && warmupIndex === days[dayIndex].warmups.length - 1) ? (
        <Button
          variant="danger"
          onClick={handleAddWarmupClick}
          startIcon={<PlusIcon className="h-4 w-4" />}
          className="mt-4"
        >
          {getAddWarmupButtonTitle()}
        </Button>
      ) : null}
    </>
  );
};