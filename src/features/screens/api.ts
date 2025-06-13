import { ErrorMessage, ResponseMessage, ScreensResponse } from '@/types';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

export const fetchScreens = async () => {
  try {
    const result = (await axios.get(`/screens`)) as ScreensResponse;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const updateScreens = async (payload : {
  vimeo: string,
  image: File;
  imageLogin: File;
  imageSignup: File;
  imageForgot: File;
  imageEmailConfirm: File;
  imageDashboard: File;
  imageStreakCalendar: File;
  imageMonthView: File;
  imageToday: File;
  imageTools: File;
  imageExerciseLibrary: File;
  imageGraphs: File;
  imageAchievement: File;
  imageApparel: File;
  imageFAQs: File;
  imageProfile: File;
  imageMyProfle: File;
  imageSetting: File;
  deleteImage: boolean;
  deleteImageLogin: boolean;
  deleteImageSignup: boolean;
  deleteImageForgot: boolean;
  deleteImageEmailConfirm: boolean;
  deleteImageDashboard: boolean;
  deleteImageStreakCalendar: boolean;
  deleteImageMonthView: boolean;
  deleteImageToday: boolean;
  deleteImageTools: boolean;
  deleteImageExerciseLibrary: boolean;
  deleteImageGraphs: boolean;
  deleteImageAchievement: boolean;
  deleteImageApparel: boolean;
  deleteImageFAQs: boolean;
  deleteImageProfile: boolean;
  deleteImageMyProfile: boolean;
  deleteImageSetting: boolean;
  slides: {
    title: string,
    description: string
  }[]
}) => {
  try {
    const formData = new FormData();
    formData.append('vimeoId', payload.vimeo);
    formData.append('slides', JSON.stringify(payload.slides));
    if (payload.imageLogin) {
      formData.append('imageLogin', payload.imageLogin);
    }
    if (payload.imageSignup) {
      formData.append('imageSignup', payload.imageSignup);
    }
    if (payload.imageForgot) {
      formData.append('imageForgot', payload.imageForgot);
    }
    if (payload.imageEmailConfirm) {
      formData.append('imageEmailConfirm', payload.imageEmailConfirm);
    }
    if (payload.imageDashboard) {
      formData.append('imageDashboard', payload.imageDashboard);
    }
    if (payload.imageStreakCalendar) {
      formData.append('imageStreakCalendar', payload.imageStreakCalendar);
    }
    if (payload.imageMonthView) {
      formData.append('imageMonthView', payload.imageMonthView);
    }
    if (payload.imageToday) {
      formData.append('imageToday', payload.imageToday);
    }
    if (payload.imageTools) {
      formData.append('imageTools', payload.imageTools);
    }
    if (payload.imageExerciseLibrary) {
      formData.append('imageExerciseLibrary', payload.imageExerciseLibrary);
    }
    if (payload.imageGraphs) {
      formData.append('imageGraphs', payload.imageGraphs);
    }
    if (payload.imageAchievement) {
      formData.append('imageAchievement', payload.imageAchievement);
    }
    if (payload.imageApparel) {
      formData.append('imageApparel', payload.imageApparel);
    }
    if (payload.imageFAQs) {
      formData.append('imageFAQs', payload.imageFAQs);
    }
    if (payload.imageProfile) {
      formData.append('imageProfile', payload.imageProfile);
    }
    if (payload.imageMyProfle) {
      formData.append('imageMyProfle', payload.imageMyProfle);
    }
    if (payload.imageSetting) {
      formData.append('imageSetting', payload.imageSetting);
    }

    const updatedScreens = formData;
    const result = (await axios.put('/screens', updatedScreens, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-screens');
      return 'screens successfully updated.';
    }
    return result.message;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};
