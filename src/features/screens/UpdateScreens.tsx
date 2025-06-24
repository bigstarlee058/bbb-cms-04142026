import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/outline';
import { useFormik } from 'formik';
import { useMutation } from 'react-query';
import { Button } from '@/components/Elements';
import { FormDrawer, Field, Dropzone } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { updateScreensSchema } from '@/utils/yup';
import { updateScreens } from './api';
import { Textarea } from '@/components/Form';
import { DeleteConfirmation } from '../workouts/components/custom';

interface FormikState {
  vimeo: string;
  image?: any;
  imageLogin?: any;
  imageSignup?: any;
  imageForgot?: any;
  imageEmailConfirm?: any;
  imageDashboard?: any;
  imageStreakCalendar?: any;
  imageMonthView?: any;
  imageToday?: any;
  imageTools?: any;
  imageExerciseLibrary?: any;
  imageGraphs?: any;
  imageAchievement?: any;
  imageApparel?: any;
  imageFAQs?: any;
  imageTutorial?: any;
  imageSubscription?: any;
  imageProfile?: any;
  imageMyProfle?: any;
  imageSetting?: any;
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
  deleteImageTutorial: boolean;
  deleteImageSubscription: boolean;
  deleteImageProfile: boolean;
  deleteImageMyProfile: boolean;
  deleteImageSetting: boolean;

  slides: {
    title: string;
    description: string;
  }[];
}

export const UpdateScreens = ({ screenData }) => {
  const { addNotification } = useNotificationStore();

  const initialValues: FormikState = {
    vimeo: screenData?.vimeoId || '',
    image: screenData?.imgUrl || '',
    imageLogin: screenData?.imageLogin || '',
    imageSignup: screenData?.imageSignup || '',
    imageForgot: screenData?.imageForgot || '',
    imageEmailConfirm: screenData?.imageEmailConfirm || '',
    imageDashboard: screenData?.imageDashboard || '',
    imageStreakCalendar: screenData?.imageStreakCalendar || '',
    imageMonthView: screenData?.imageMonthView || '',
    imageToday: screenData?.imageToday || '',
    imageTools: screenData?.imageTools || '',
    imageExerciseLibrary: screenData?.imageExerciseLibrary || '',
    imageGraphs: screenData?.imageGraphs || '',
    imageAchievement: screenData?.imageAchievement || '',
    imageApparel: screenData?.imageApparel || '',
    imageFAQs: screenData?.imageFAQs || '',
    imageTutorial: screenData?.imageTutorial || '',
    imageSubscription: screenData?.imageSubscription || '',
    imageProfile: screenData?.imageProfile || '',
    imageMyProfle: screenData?.imageMyProfle || '',
    imageSetting: screenData?.imageSetting || '',
    deleteImage: false,
    deleteImageLogin: false,
    deleteImageSignup: false,
    deleteImageForgot: false,
    deleteImageEmailConfirm: false,
    deleteImageDashboard: false,
    deleteImageStreakCalendar: false,
    deleteImageMonthView: false,
    deleteImageToday: false,
    deleteImageTools: false,
    deleteImageExerciseLibrary: false,
    deleteImageGraphs: false,
    deleteImageAchievement: false,
    deleteImageApparel: false,
    deleteImageFAQs: false,
    deleteImageTutorial: false,
    deleteImageSubscription: false,
    deleteImageProfile: false,
    deleteImageMyProfile: false,
    deleteImageSetting: false,
    slides: screenData?.slides || [{ title: '', description: '' }]
  };
  const formik = useFormik({
    initialValues,
    validationSchema: updateScreensSchema,
    onSubmit: (v) => onSubmit(v)
  });

  const { mutate, isLoading, isSuccess } = useMutation(updateScreens, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message
      });
    }
  });

  const onSubmit = (state: FormikState) => {
    const { vimeo, image, imageLogin,  imageSignup, imageForgot, imageEmailConfirm, imageDashboard, imageStreakCalendar, imageMonthView, imageToday, imageTools, imageExerciseLibrary, imageGraphs, imageAchievement, imageApparel, imageFAQs, imageTutorial, imageSubscription, imageProfile, imageMyProfle, imageSetting,
      deleteImage, deleteImageLogin, deleteImageSignup, deleteImageForgot, deleteImageEmailConfirm, deleteImageDashboard, deleteImageStreakCalendar, deleteImageMonthView, deleteImageToday, deleteImageTools, deleteImageExerciseLibrary, deleteImageGraphs, deleteImageAchievement, deleteImageApparel, deleteImageFAQs,  deleteImageProfile, deleteImageMyProfile, deleteImageSetting, slides } = state;
    mutate({ vimeo, image, imageLogin,  imageSignup, imageForgot, imageEmailConfirm, imageDashboard, imageStreakCalendar, imageMonthView, imageToday, imageTools, imageExerciseLibrary, imageGraphs, imageAchievement, imageApparel, imageFAQs, imageTutorial, imageSubscription, imageProfile, imageMyProfle, imageSetting,
      deleteImage, deleteImageLogin, deleteImageSignup, deleteImageForgot, deleteImageEmailConfirm, deleteImageDashboard, deleteImageStreakCalendar, deleteImageMonthView, deleteImageToday, deleteImageTools, deleteImageExerciseLibrary, deleteImageGraphs, deleteImageAchievement, deleteImageApparel, deleteImageFAQs, deleteImageProfile, deleteImageMyProfile, deleteImageSetting, slides });
  };

  const onAddSlide = () => {
    if (formik.values.slides.length === 3) return;
    const newSlides = [...formik.values.slides, { title: '', description: '' }];
    formik.setFieldValue('slides', newSlides);
  };

  const onDeleteSlide = (index: number) => {
    const newSlides = formik.values.slides.filter((_, i) => i !== index);
    formik.setFieldValue('slides', newSlides);
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button size="sm" variant="danger" startIcon={<PencilIcon className="h-4 w-4" />}>
            &nbsp;Update Screens
          </Button>
        }
        title="Update Screens"
        submitButton={
          <Button form="update-screens" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-screens" onSubmit={formik.handleSubmit}>
          <Field disabled label="Vimeo" formik={formik} name="vimeo" />
          <div className="flex justify-between items-end">
            <label className="fieldLabel">Slides</label>
            <Button
              variant="danger"
              name="add slide"
              startIcon={<PlusIcon className="h-6 w-4" />}
              onClick={onAddSlide}
            />
          </div>
          {(formik.values.slides ?? []).map((_slide, index) => (
            <div key={index} className="p-4 bg-gray-200 rounded shadow-md mt-4">
              <div className="flex justify-between items-end">
                <label className="fieldLabel">Slide</label>
                <Button variant="danger" startIcon={<TrashIcon className="h-4 w-4" />} onClick={() => onDeleteSlide(index)}></Button>
              </div>
              <Field label="Title" formik={formik} name={`slides[${index}].title`} />
              <Textarea label="Description" formik={formik} name={`slides[${index}].description`} />
            </div>
          ))}

          <div className="mt-5">
            <label className="fieldLabel">Signin Screen Background</label>
            <Dropzone
              label="Thumbnail"
              name="thumbnail"
              formik={formik}
              defaultImg={formik.values.imageLogin}
              onDrop={(img) => formik.setFieldValue('imageLogin', img)}
              onDelete={() => formik.setValues({ ...formik.values, imageLogin: '', deleteImageLogin: true })}
            />
          </div>
          <div className="mt-5">
            <label className="fieldLabel">Signup Screen Background</label>
            <Dropzone
              label="Thumbnail"
              name="thumbnail"
              formik={formik}
              defaultImg={formik.values.imageSignup}
              onDrop={(img) => formik.setFieldValue('imageSignup', img)}
              onDelete={() => formik.setValues({ ...formik.values, imageSignup: '', deleteImageSignup: true })}
            />
          </div>
          <div className="mt-5">
            <label className="fieldLabel">Forgot Password Screen Background</label>
            <Dropzone
              label="Thumbnail"
              name="thumbnail"
              formik={formik}
              defaultImg={formik.values.imageForgot}
              onDrop={(img) => formik.setFieldValue('imageForgot', img)}
              onDelete={() => formik.setValues({ ...formik.values, imageForgot: '', deleteImageForgot: true })}
            />
          </div>
          <div className="mt-5">
            <label className="fieldLabel">Email confirmation Screen Background</label>
            <Dropzone
              label="Thumbnail"
              name="thumbnail"
              formik={formik}
              defaultImg={formik.values.imageEmailConfirm}
              onDrop={(img) => formik.setFieldValue('imageEmailConfirm', img)}
              onDelete={() => formik.setValues({ ...formik.values, imageEmailConfirm: '', deleteImageEmailConfirm: true })}
            />
          </div>
          <div className="mt-5">
            <label className="fieldLabel">Dashboard Screen Background</label>
            <Dropzone
              label="Thumbnail"
              name="thumbnail"
              formik={formik}
              defaultImg={formik.values.imageDashboard}
              onDrop={(img) => formik.setFieldValue('imageDashboard', img)}
              onDelete={() => formik.setValues({ ...formik.values, imageDashboard: '', deleteImageDashboard: true })}
            />
          </div>
          <div className="mt-5">
            <label className="fieldLabel">Streak calendar Screen Background</label>
            <Dropzone
              label="Thumbnail"
              name="thumbnail"
              formik={formik}
              defaultImg={formik.values.imageStreakCalendar}
              onDrop={(img) => formik.setFieldValue('imageStreakCalendar', img)}
              onDelete={() => formik.setValues({ ...formik.values, imageStreakCalendar: '', deleteImageStreakCalendar: true })}
            />
          </div>
          <div className="mt-5">
            <label className="fieldLabel">Month view Screen Background</label>
            <Dropzone
              label="Thumbnail"
              name="thumbnail"
              formik={formik}
              defaultImg={formik.values.imageMonthView}
              onDrop={(img) => formik.setFieldValue('imageMonthView', img)}
              onDelete={() => formik.setValues({ ...formik.values, imageMonthView: '', deleteImageMonthView: true })}
            />
          </div>
          <div className="mt-5">
            <label className="fieldLabel">Day Screen Background</label>
            <Dropzone
              label="Thumbnail"
              name="thumbnail"
              formik={formik}
              defaultImg={formik.values.imageToday}
              onDrop={(img) => formik.setFieldValue('imageToday', img)}
              onDelete={() => formik.setValues({ ...formik.values, imageToday: '', deleteImageToday: true })}
            />
          </div>
          <div className="mt-5">
            <label className="fieldLabel">Tools Screen Background</label>
            <Dropzone
              label="Thumbnail"
              name="thumbnail"
              formik={formik}
              defaultImg={formik.values.imageTools}
              onDrop={(img) => formik.setFieldValue('imageTools', img)}
              onDelete={() => formik.setValues({ ...formik.values, imageTools: '', deleteImageTools: true })}
            />
          </div>
          <div className="mt-5">
            <label className="fieldLabel">Exercise Library Screen Background</label>
            <Dropzone
              label="Thumbnail"
              name="thumbnail"
              formik={formik}
              defaultImg={formik.values.imageExerciseLibrary}
              onDrop={(img) => formik.setFieldValue('imageExerciseLibrary', img)}
              onDelete={() => formik.setValues({ ...formik.values, imageExerciseLibrary: '', deleteImageExerciseLibrary: true })}
            />
          </div>
          <div className="mt-5">
            <label className="fieldLabel">Graphs & Reports Screen Background</label>
            <Dropzone
              label="Thumbnail"
              name="thumbnail"
              formik={formik}
              defaultImg={formik.values.imageGraphs}
              onDrop={(img) => formik.setFieldValue('imageGraphs', img)}
              onDelete={() => formik.setValues({ ...formik.values, imageGraphs: '', deleteImageGraphs: true })}
            />
          </div>
          <div className="mt-5">
            <label className="fieldLabel">Achievements Screen Background</label>
            <Dropzone
              label="Thumbnail"
              name="thumbnail"
              formik={formik}
              defaultImg={formik.values.imageAchievement}
              onDrop={(img) => formik.setFieldValue('imageAchievement', img)}
              onDelete={() => formik.setValues({ ...formik.values, imageAchievement: '', deleteImageAchievement: true })}
            />
          </div>
          <div className="mt-5">
            <label className="fieldLabel">Apparel & Equipment Screen Background</label>
            <Dropzone
              label="Thumbnail"
              name="thumbnail"
              formik={formik}
              defaultImg={formik.values.imageApparel}
              onDrop={(img) => formik.setFieldValue('imageApparel', img)}
              onDelete={() => formik.setValues({ ...formik.values, imageApparel: '', deleteImageApparel: true })}
            />
          </div>
          <div className="mt-5">
            <label className="fieldLabel">FAQ Screen Background</label>
            <Dropzone
              label="Thumbnail"
              name="thumbnail"
              formik={formik}
              defaultImg={formik.values.imageFAQs}
              onDrop={(img) => formik.setFieldValue('imageFAQs', img)}
              onDelete={() => formik.setValues({ ...formik.values, imageFAQs: '', deleteImageFAQs: true })}
            />
          </div>
          <div className="mt-5">
            <label className="fieldLabel">Tutorial Screen Background</label>
            <Dropzone
              label="Thumbnail"
              name="thumbnail"
              formik={formik}
              defaultImg={formik.values.imageTutorial}
              onDrop={(img) => formik.setFieldValue('imageTutorial', img)}
              onDelete={() => formik.setValues({ ...formik.values, imageTutorial: '', deleteImageTutorial: true })}
            />
          </div>
          <div className="mt-5">
            <label className="fieldLabel">Subscription Screen Background</label>
            <Dropzone
              label="Thumbnail"
              name="thumbnail"
              formik={formik}
              defaultImg={formik.values.imageSubscription}
              onDrop={(img) => formik.setFieldValue('imageSubscription', img)}
              onDelete={() => formik.setValues({ ...formik.values, imageSubscription: '', deleteImageSubscription: true })}
            />
          </div>
          <div className="mt-5">
            <label className="fieldLabel">Account Screen Background</label>
            <Dropzone
              label="Thumbnail"
              name="thumbnail"
              formik={formik}
              defaultImg={formik.values.imageProfile}
              onDrop={(img) => formik.setFieldValue('imageProfile', img)}
              onDelete={() => formik.setValues({ ...formik.values, imageProfile: '', deleteImageProfile: true })}
            />
          </div>
          <div className="mt-5">
            <label className="fieldLabel">My Profile Screen Background</label>
            <Dropzone
              label="Thumbnail"
              name="thumbnail"
              formik={formik}
              defaultImg={formik.values.imageMyProfle}
              onDrop={(img) => formik.setFieldValue('imageMyProfle', img)}
              onDelete={() => formik.setValues({ ...formik.values, imageMyProfle: '', deleteImageMyProfile: true })}
            />
          </div>
          <div className="mt-5">
            <label className="fieldLabel">Settings Screen Background</label>
            <Dropzone
              label="Thumbnail"
              name="thumbnail"
              formik={formik}
              defaultImg={formik.values.imageSetting}
              onDrop={(img) => formik.setFieldValue('imageSetting', img)}
              onDelete={() => formik.setValues({ ...formik.values, imageSetting: '', deleteImageSetting: true })}
            />
          </div>
        </form>
      </FormDrawer>
    </Authorization>
  );
};
