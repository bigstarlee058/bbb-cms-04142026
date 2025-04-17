import { Field, Textarea, Dropzone, Select } from './custom';
import { useQuery } from 'react-query';
import { fetchPumpDayTitles, fetchRestdayTitles } from '../api';
import { TitleResponse } from '@/types';
// import { fetchPumpDayTitles } from '@/features/pump-days/api';

export const WeekDetail = ({ monthIndex, weekIndex, week, updateWeek }) => {
  const { data: titles, isLoading } = useQuery('get-restday-titles', () => fetchRestdayTitles({ filterString: '' }));
  const { data: pumpDayTitles, isLoading: isPumpDayLoading } = useQuery('get-pump-day-titles', () =>
    fetchPumpDayTitles({ filterString: '' })
  );

  const updateWeekDetail = (key, value) => {
    const updatedWeek = { ...week, [key]: value };
    updateWeek(monthIndex, weekIndex, updatedWeek);
  };
  const handleChange = (key, value) => {
    updateWeekDetail(key, value);
  };

  return (
    <div className="mb-4 flex mt-[25px]">
      <div className="w-1/2">
        <Textarea label="Description" name="description" value={week.description} onChange={handleChange} hasHeight = {false} />
      </div>
      <div className="w-1/2 ml-4 mr-4 mt-6 space-y-2">
        {/* <Dropzone
          defaultImg={week.thumbnail}
          onDrop={(img) => {handleChange('thumbnail', img)}}
          onDelete={() => {handleChange('thumbnail', null)}}
          file={week.thumbnail}
        /> */}
        {/* <Field label="Vimeo Id" name="vimeoId" value={week.vimeoId} onChange={handleChange}/> */}
        <Select
          label="Rest Day"
          options={titles?.map(({ title, id }) => ({ label: title, id: id })) || []}
          value={(() => {
            const selectedTitle = titles?.find((title) => title.id === week.restdayId);
            return selectedTitle ? { label: selectedTitle.title, value: selectedTitle.id } : null;
          })()}
          isLoading={isLoading}
          className="w-[300px]"
          onChange={(newValue: TitleResponse) => {
            handleChange('restdayId', newValue.id);
          }}
        />
        <Select
          isMulti
          label="Pump Days"
          options={pumpDayTitles?.map(({ title, _id }) => ({ label: title, value: _id })) || []}
          value={(week.pumpDayIds ?? []).map((id) => {
            const selectedTitle = pumpDayTitles?.find((pumpDay) => pumpDay._id === id);
            return { label: selectedTitle?.title || '', value: id };
          })}
          isLoading={isPumpDayLoading}
          className="w-[300px]"
          onChange={(value: TitleResponse[]) => {
            handleChange(
              'pumpDayIds',
              value.map((v: any) => v.value)
            );
          }}
        />
      </div>
    </div>
  );
};
