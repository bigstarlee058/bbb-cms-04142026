import { ErrorMessage, TitleFilters, ExerciseTitleResponse, EquipmentTitleResponse, WorkoutsResponse, Filters, WarmupTitleResponse } from '@/types';
import { axios } from '@/lib/axios';
import { Month } from '@/types';
import { storage } from '@/utils/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

export const fetchExerciseTitles = async (filters: TitleFilters) => {
  try {
    const result = await axios.get(`/exercises/admin/titlefilter`, { params: filters }) as ExerciseTitleResponse[];
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const fetchEquipmentTitles = async (filters: TitleFilters) => {
  try {
    const result = await axios.get(`/equipments/admin/titlefilter`, { params: filters }) as EquipmentTitleResponse[];
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const fetchWarmupTitles = async (filters: TitleFilters) => {
  try {
    const result = await axios.get(`/warmups/admin/titlefilter`, { params: filters }) as WarmupTitleResponse[];
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const fetchWorkouts = async (filters: Filters) => {
  try {
    const result = await axios.get('/workouts', { params: filters }) as WorkoutsResponse;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const fetchMonthById = async (id: string) => {
  try {
    const result = await axios.get(`/workouts/${id}`) as Month;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

const uploadImageAndGetURL = async (image: File): Promise<string> => {
  try {
    const storageRef = ref(storage, 'workout_thumbnails/' + image.name);
    await uploadBytes(storageRef, image);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (err: any) {
    throw new Error('Failed to upload image: ' + err.message);
  }
};

export const updateWorkouts = async (months: Month[]) => {
  try {
    // Function to recursively collect all thumbnails
    const collectThumbnails = (month: Month): Promise<string[]> => {
      const thumbnails: File[] = [];
      if (month.thumbnail instanceof File) {
        thumbnails.push(month.thumbnail);
      }
      month.weeks.forEach(week => {
        if (week.thumbnail instanceof File) {
          thumbnails.push(week.thumbnail);
        }
        week.days.forEach(day => {
          if (day.thumbnail instanceof File) {
            thumbnails.push(day.thumbnail);
          }
        });
      });
      return Promise.all(thumbnails.map(file => uploadImageAndGetURL(file)));
    };

    // Process each month to update thumbnails
    const updatedMonths = await Promise.all(months.map(async (month) => {
      const thumbnailURLs = await collectThumbnails(month);
      
      // Helper function to update thumbnails recursively
      const updateThumbnails = (item: any, urls: string[]) => {
        if (item.thumbnail instanceof File) {
          item.thumbnail = urls.shift()!;
        }
        if (item.weeks) {
          item.weeks.forEach(week => updateThumbnails(week, urls));
        }
        if (item.days) {
          item.days.forEach(day => updateThumbnails(day, urls));
        }
      };

      updateThumbnails(month, thumbnailURLs);

      return month;
    }));

    // Submit the updated months with new thumbnail URLs
    const response = await axios.put('/workouts/update', { months: updatedMonths });
    return response;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err.message,
    };
    return Promise.reject(error);
  }
};