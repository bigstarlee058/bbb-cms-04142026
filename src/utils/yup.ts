import * as Yup from 'yup';
const MAX_FILE_SIZE = 102400; //100KB
type ValidFileExtensions = {
  image: string[];
};
const validFileExtensions: ValidFileExtensions = {
  image: ['jpg', 'gif', 'png', 'jpeg', 'svg', 'webp'],
};
const isValidFileType = (fileName: string, fileType: keyof ValidFileExtensions) => {
  return (
    fileName && validFileExtensions[fileType].indexOf(fileName.split('.').pop() as string) > -1
  );
};

Yup.setLocale({
  mixed: {
    required: 'The field is required',
    oneOf: '',
  },
  string: {
    email: 'You have entered wrong email address',
    min({ min }) {
      return `The field must have at least ${min} characters`;
    },
    max({ max }) {
      return `The field must have at least ${max} characters`;
    },
  },
});
export const userLoginSchema = Yup.object().shape({
  email: Yup.string().max(255).required(),
  password: Yup.string().max(255).required(),
});

export const createExerciseSchema = Yup.object().shape({
  title: Yup.string().max(255).required(),
  // description: Yup.string().max(255).required(),
  vimeoId: Yup.string().max(255).required(),
  thumbnail: Yup.mixed().required('Thumbnail is required'),
  videoThumbnail: Yup.mixed().required('Video Thumbnail is required'),
});

export const createEquipmentSchema = Yup.object().shape({
  title: Yup.string().max(255).required(),
  link: Yup.string().max(255).required(),
  image: Yup.mixed().required('Thumbnail is required'),
});

export const createWarmupSchema = Yup.object().shape({
  title: Yup.string().max(255).required(),
  vimeoId: Yup.string().max(255).required(),
  thumbnail: Yup.mixed().required('Thumbnail is required'),
  videoThumbnail: Yup.mixed().required('Video Thumbnail is required'),
});

export const createRestdaySchema = Yup.object().shape({
  title: Yup.string().max(255).required(),
  vimeoId: Yup.string().max(255).required(),
  description: Yup.string().max(255).required(),
});

export const createVimeoSchema = Yup.object().shape({
  vimeoId: Yup.string().max(255).required(),
});

export const createUserSchema = Yup.object().shape({
  firstname: Yup.string().max(255).required(),
  lastname: Yup.string().max(255).required(),
});

export const createCollectionSchema = Yup.object().shape({
  title: Yup.string().max(255).required(),
  image: Yup.mixed().required('Thumbnail is required'),
});

export const createBonusSchema = Yup.object().shape({
  title: Yup.string().max(255).required(),
  image: Yup.mixed().required('Thumbnail is required'),
});

export const createCategorySchema = Yup.object().shape({
  title: Yup.string().max(255).required(),
  image: Yup.mixed().required('Thumbnail is required'),
});
export const createTagsSchema = Yup.object().shape({
  title: Yup.string().max(255).required(),
});
export const createTagSchema = Yup.object().shape({
  title: Yup.string().max(255).required(),
  type: Yup.string().max(255).required(),
});

export const createStaffSchema = Yup.object().shape({
  title: Yup.string().max(255).required(),
  type: Yup.string().max(255).required(),
  image: Yup.mixed().required('Photo is required'),
});

export const createChallengeSchema = Yup.object().shape({
  title: Yup.string().max(255).required(),
  link: Yup.string().max(255).required(),
  buttonText: Yup.string().max(255).required(),
  image: Yup.mixed().required('Photo is required'),
});

export const createQuizSchema = Yup.object().shape({
  title: Yup.string().max(255).required(),
  level: Yup.string().max(255).required(),
});

export const updateScreensSchema = Yup.object().shape({
  vimeoId: Yup.string().max(255).required(),
  image: Yup.mixed().required('Image is required'),
});

export const updateVersionSchema = Yup.object().shape({
  androidVersion: Yup.string().max(255).required(),
  iosVersion: Yup.string().max(255).required(),
  androidForceUpdate: Yup.boolean(),
  iosForceUpdate: Yup.boolean(),
  update_title: Yup.string().max(255).required(),
  update_message: Yup.string().max(1000).required(),
});
export const createSettingsSchema = Yup.object().shape({
  image: Yup.mixed().required('Image is required'),
});

export const createSectionSchema = Yup.object().shape({
  title: Yup.string().max(255).required(),
});

export const createPumpDaySchema = Yup.object().shape({
  title: Yup.string().max(255).required(),
});

export const createFaqsSchema = Yup.object().shape({
  question: Yup.string().max(1024).required(),
});

export const createCircuitSchema = Yup.object().shape({
  title: Yup.string().max(255).required(),
});

export const updatePhasesMainInfoSchema = Yup.object().shape({
  title: Yup.string().max(255).required(),
  image: Yup.mixed().required('Thumbnail is required'),
  contenttitle: Yup.string().max(255).required(),
});

export const createPhasesSchema = Yup.object().shape({
  title: Yup.string().max(255).required(),
  image: Yup.mixed().required('Thumbnail is required'),
});

export const createTutorialSchema = Yup.object().shape({
  title: Yup.string().max(255).required(),
  vimeoId: Yup.string().max(255).required(),
  image: Yup.mixed().required('Thumbnail is required'),
});
export const createToolSchema = Yup.object().shape({
  title: Yup.string().max(255).required('Title is required'),
  toolName: Yup.string()
    .max(255)
    .required('Tool name is required')
    .matches(
      /^[a-zA-Z][a-zA-Z0-9_-]*$/,
      'Tool name must start with a letter and contain only letters, numbers, hyphens, and underscores (no spaces)'
    ),
  titleTranslations: Yup.object().test(
    'translations-required',
    'All selected translations are required',
    function (value) {
      if (!value) return true;
      const entries = Object.entries(value);
      for (const [key, val] of entries) {
        if (val !== undefined && typeof val === 'string' && val.trim() === '') {
          return this.createError({
            path: `titleTranslations.${key}`,
            message: 'Title is required',
          });
        }
      }
      return true;
    }
  ),
  visible: Yup.boolean(),
});