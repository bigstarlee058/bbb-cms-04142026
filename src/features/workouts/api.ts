import { ErrorMessage, TitleFilters, TitleResponse, WorkoutsResponse, Filters, ResponseMessage, Day, PumpDaysResponse } from '@/types';
import { axios } from '@/lib/axios';
import { Month } from '@/types';

interface UploadResponse {
  success: boolean;
  url: string[];
}

export const fetchAchievementsIndividualTitles = async (filters: TitleFilters) => {
  try {
    const result = (await axios.get(`/achievements-individual/admin/titlefilter`, { params: filters })) as TitleResponse[];
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string
    };
    return Promise.reject(error);
  }
};

export const fetchAchievementsTargetTitles = async (filters: TitleFilters) => {
  try {
    const result = (await axios.get(`/achievements-target/admin/titlefilter`, { params: filters })) as TitleResponse[];
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string
    };
    return Promise.reject(error);
  }
};

export const fetchExerciseTitles = async (filters: TitleFilters) => {
  try {
    const result = (await axios.get(`/exercises/admin/titlefilter`, { params: filters })) as TitleResponse[];
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string
    };
    return Promise.reject(error);
  }
};

export const fetchCategoryTitles = async (filters: TitleFilters) => {
  try {
    const result = (await axios.get(`/categories/admin/titlefilter`, { params: filters })) as TitleResponse[];
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string
    };
    return Promise.reject(error);
  }
};

export const fetchTagTitles = async (filters: TitleFilters) => {
  try {
    const result = (await axios.get(`/tags/admin/titlefilter`, { params: filters })) as TitleResponse[];
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string
    };
    return Promise.reject(error);
  }
};

export const fetchCollectionTitles = async (filters: TitleFilters) => {
  try {
    const result = (await axios.get(`/collections/admin/titlefilter`, { params: filters })) as TitleResponse[];
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string
    };
    return Promise.reject(error);
  }
};

export const fetchEquipmentTitles = async (filters: TitleFilters) => {
  try {
    const result = (await axios.get(`/equipments/admin/titlefilter`, { params: filters })) as TitleResponse[];
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string
    };
    return Promise.reject(error);
  }
};

export const fetchWarmupTitles = async (filters: TitleFilters) => {
  try {
    const result = (await axios.get(`/warmups/admin/titlefilter`, { params: filters })) as TitleResponse[];
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string
    };
    return Promise.reject(error);
  }
};

export const fetchRestdayTitles = async (filters: TitleFilters) => {
  try {
    const result = (await axios.get(`/restdays/admin/titlefilter`, { params: filters })) as TitleResponse[];
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string
    };
    return Promise.reject(error);
  }
};

export const fetchPumpDayTitles = async (filters: TitleFilters) => {
  try {
    const result = (await axios.get(`/pump-days/admin/titlefilter`, { params: filters })) as {title: string, _id: string}[];
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string
    };
    return Promise.reject(error);
  }
};

export const fetchWorkouts = async (filters: Filters) => {
  try {
    const result = (await axios.get('/workouts', { params: filters })) as WorkoutsResponse;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string
    };
    return Promise.reject(error);
  }
};

export const fetchMonthById = async (id: string) => {
  try {
    const result = (await axios.get(`/workouts/${id}`)) as Month;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string
    };
    return Promise.reject(error);
  }
};

const uploadImagesAndGetURLs = async (images: (File | string | null)[]): Promise<string[]> => {
  try {
    // Check if there are any File objects in the images array
    const hasFiles = images.some((image) => image instanceof File);

    // If no File objects, return the string URLs directly (ignoring null values)
    if (!hasFiles) {
      const downloadURLs = images.map((image) => (typeof image === 'string' ? image : null)); // Keep existing strings, replace nulls with empty strings
      console.log('No files to upload. Using existing URLs:', downloadURLs);
      return downloadURLs;
    }

    // Otherwise, proceed to upload the files
    const formData = new FormData();

    // Append only valid File objects to the form data
    images.forEach((image, index) => {
      if (image instanceof File) {
        formData.append(`file_${index}`, image);
      }
    });

    // Upload files to the backend
    const response = await axios.post<UploadResponse>('/workouts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    // Log the full response to inspect its structure
    console.log('Full Axios Response:', response);

    // Safely access response.data.url, and ensure the response has the correct structure
    const uploadedURLs: string[] = response.data.url; // Safely handle undefined response.data
    console.log('Uploaded URLs:', uploadedURLs);

    if (!uploadedURLs.length) {
      throw new Error('No URLs returned from the server');
    }

    // Reconstruct the original array by replacing files with their URLs and keeping strings/URLs as is
    const downloadURLs = images.map((image, index) => {
      if (image instanceof File) {
        return uploadedURLs.shift() || ''; // Replace file with corresponding uploaded URL, default to empty string if undefined
      } else if (typeof image === 'string') {
        return image; // Keep existing URLs
      } else {
        return null; // Handle null cases or provide a placeholder
      }
    });

    console.log('Final Download URLs:', downloadURLs);
    return downloadURLs;
  } catch (err: any) {
    console.error('Error uploading images:', err);
    throw new Error('Failed to upload images: ' + err.message);
  }
};

export const updateWorkouts = async (months: Month[]) => {
  try {
    // Function to recursively collect all thumbnails
    const collectThumbnails = (month: Month): (File | string | null)[] => {
      const thumbnails: (File | string | null)[] = [];

      // Check if month thumbnail is a File or a URL (string)
      if (month.thumbnail instanceof File || typeof month.thumbnail === 'string') {
        thumbnails.push(month.thumbnail);
      } else {
        thumbnails.push(null); // Add null for invalid values
      }

      month.weeks.forEach((week) => {
        // Check if week thumbnail is a File or a URL (string)
        if (week.thumbnail instanceof File || typeof week.thumbnail === 'string') {
          thumbnails.push(week.thumbnail);
        } else {
          thumbnails.push(null);
        }

        week.days.forEach((day) => {
          // Check if day thumbnail is a File or a URL (string)
          if (day.thumbnail instanceof File || typeof day.thumbnail === 'string') {
            thumbnails.push(day.thumbnail);
          } else {
            thumbnails.push(null);
          }
          if (day.thumbnailOne instanceof File || typeof day.thumbnailOne === 'string') {
            thumbnails.push(day.thumbnailOne);
          } else {
            thumbnails.push(null);
          }
          if (day.thumbnailTwo instanceof File || typeof day.thumbnailTwo === 'string') {
            thumbnails.push(day.thumbnailTwo);
          } else {
            thumbnails.push(null);
          }
          if (day.thumbnailThree instanceof File || typeof day.thumbnailThree === 'string') {
            thumbnails.push(day.thumbnailThree);
          } else {
            thumbnails.push(null);
          }
        });
      });

      return thumbnails;
    };

    // Collect all the thumbnails from all months
    let allThumbnails: (File | string | null)[] = [];

    months.forEach((month) => {
      // Filter out any non-File (i.e., string or null) and concatenate valid File objects
      allThumbnails = allThumbnails.concat(collectThumbnails(month));
    });

    // Upload all thumbnails in one request
    const thumbnailURLs = await uploadImagesAndGetURLs(allThumbnails);

    // Process each month to update thumbnails with the received URLs
    let urlIndex = 0;
    const updateThumbnails = (item: any) => {
      if (urlIndex < thumbnailURLs.length) {
        item.thumbnail = thumbnailURLs[urlIndex];
        urlIndex++;
      }
      if (item.weeks) {
        item.weeks.forEach((week) => updateThumbnails(week));
      }
      if (item.days) {
        item.days.forEach((day) => {
          if (urlIndex < thumbnailURLs.length) {
            day.thumbnail = thumbnailURLs[urlIndex];
            urlIndex++;
          }
          if (urlIndex < thumbnailURLs.length) {
            day.thumbnailOne = thumbnailURLs[urlIndex];
            urlIndex++;
          }
          if (urlIndex < thumbnailURLs.length) {
            day.thumbnailTwo = thumbnailURLs[urlIndex];
            urlIndex++;
          }
          if (urlIndex < thumbnailURLs.length) {
            day.thumbnailThree = thumbnailURLs[urlIndex];
            urlIndex++;
          }
        })
        // item.days.forEach((day) => updateThumbnails(day));
        
      }
    };

    months.forEach((month) => updateThumbnails(month));

    // Submit the updated months with new thumbnail URLs
    console.log('Updated Months:', months);
    const response = (await axios.put('/workouts/update', { months })) as ResponseMessage;
    return response.message;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err.message
    };
    return Promise.reject(error);
  }
};

export const fetchPumpDays = async () => {
  try {
    const result = (await axios.get('/pump-days')) as PumpDaysResponse;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string
    };
    return Promise.reject(error);
  }
};

export const updatePumpDays = async (days: Day[]) => {
  try {
    // Function to recursively collect all thumbnails
    const collectThumbnails = (day: Day): (File | string | null)[] => {
      const thumbnails: (File | string | null)[] = [];

      // Check if day thumbnail is a File or a URL (string)
      if (day.thumbnail instanceof File || typeof day.thumbnail === 'string') {
        thumbnails.push(day.thumbnail);
      } else {
        thumbnails.push(null);
      }

      return thumbnails;
    };

    // Collect all the thumbnails from all months
    let allThumbnails: (File | string | null)[] = [];

    days.forEach((day) => {
      // Filter out any non-File (i.e., string or null) and concatenate valid File objects
      allThumbnails = allThumbnails.concat(collectThumbnails(day));
    });

    // Upload all thumbnails in one request
    const thumbnailURLs = await uploadImagesAndGetURLs(allThumbnails);

    // Process each month to update thumbnails with the received URLs
    let urlIndex = 0;
    const updateThumbnails = (item: any) => {
      if (urlIndex < thumbnailURLs.length) {
        item.thumbnail = thumbnailURLs[urlIndex];
        urlIndex++;
      }
    };

    days.forEach((day) => updateThumbnails(day));

    // Submit the updated days with new thumbnail URLs
    console.log('Updated Days:', days);
    const response = (await axios.put('/pump-days/admin/update', { days })) as ResponseMessage;
    return response.message;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err.message
    };
    return Promise.reject(error);
  }
};
