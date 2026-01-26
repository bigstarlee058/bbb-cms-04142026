export type BaseEntity = {
  _id: string;
  createdAt: number;
};
export interface ErrorMessage {
  status: boolean;
  message: string;
}
export interface ResponseMessage {
  result: boolean;
  message: string;
}
export type UserEvent = {
  _id: string;
  userId: string;
  source: 'wp' | 'rc' | 'admin';
  action: string;
  summary?: Record<string, any>;
  details: string;
  status: number;
  success: boolean;
  errorMessage?: string;
  performedBy?: string;
  createdAt: string;
  updatedAt: string;
};
////////////////////useless////////////////////
export interface Tag extends BaseEntity {
  name: string;
  featuredCollections: Collection[];
}
export interface TagPayload {
  name: string;
  featuredCollections: string[];
}
export interface Collection extends BaseEntity {
  title: string;
  thumbnail: string;
  description: string;
  isFeatured: boolean;
}
export interface CollectionsResponse {
  count: number;
  collections: Collection[];
}
export interface CollectionPayload {
  count: number;
  collections: Collection[];
}
export interface Bonus extends BaseEntity {
  title: string;
  thumbnail: string;
  description: string;
  isFeatured: boolean;
}
export interface BonusesResponse {
  count: number;
  bonuses: Bonus[];
}
export interface BonusPayload {
  count: number;
  bonuses: Bonus[];
}
export interface Quiz extends BaseEntity {
  title: string;
  level: number;
}
export interface QuizPayload {
  title: string;
  level: number;
}
////////////////////useless////////////////////
export interface UserSubscription {
  end_date: string;
  price: string;
  purchase_date: string;
  subscription_type: string;
  user_subscription_status: string;
  update_source?: 'admin' | 'wp' | 'rc' | null;
  update_date?: string | number | null;
}

interface DeviceInfo {
  device?: string;
  systemName?: string;
  osVersion?: string;
  appVersion?: string;
  lastLogin?: Date;
}
export interface User extends BaseEntity {
  workoutsHistory: UserWorkout[];
  subscription: UserSubscription;
  name: string;
  email: string;
  role: number;
  uid: string;
  rcUserId?:string;
  singuptype:string;
  deviceInfo:DeviceInfo;
}
export interface UsersResponse {
  users: User[];
  totalCount?: number;   
  totalPages?: number;   
  currentPage?: number;  
  hasMore?: boolean;
  lastId?: string;
}

export interface UserWorkoutHistory {
  monthTitle: string;
  monthIndex: number;
  weekTitle: string;
  weekIndex: number;
  dayIndex: number;
  exerciseTitle: string;
  split: string;
  date: string;
  status: string;
  sets: string;
  reps: string;
  weight: string;
  rest: string;
  load: string;
  effort: string;
  totalSet: string;
}

export interface Category extends BaseEntity {
  title: string;
  thumbnail: string;
  exerciseCount: number;
}
export interface CategoriesResponse {
  count: number;
  categories: Category[];
}

export interface Tags extends BaseEntity {
  title: string;
  thumbnail: string;
  exerciseCount: number;
}
export interface TagsResponse {
  count: number;
  tags: Tags[];
}

export interface Target extends BaseEntity {
  title: string;
}
export interface TargetsResponse {
  count: number;
  achievementsTargets: Target[];
}

export interface AchievementIndividual extends BaseEntity {
  title: string;
  image: string;
  targettype: string;
  target: string;
  value: string;
  description: string;
}

export interface AchievementsIndividualResponse {
  count: number;
  achievementsIndividuals: AchievementIndividual[];
}

export interface Achievement {
  index?: number;
  achievementId: string;
}

export interface AchievementsGroup extends BaseEntity {
  title: string;
  type: string;
  description: string;
  thumbnail: string;
  achievements: Achievement[]
}

export interface AchievementsGroupResponse {
  count: number;
  achievementsGroups: AchievementsGroup[];
}

export interface Equipment extends BaseEntity {
  title: string;
  thumbnail: string;
  description: string;
  link: string;
}
export interface EquipmentsResponse {
  count: number;
  equipments: Equipment[];
}
export interface Warmup extends BaseEntity {
  title: string;
  vimeoId: string;
  description: string;
  equipments: string[];
  thumbnail: string;
  videoThumbnail: string;
  length: number;
}
export interface UserWorkout extends BaseEntity {
  workoutId: string;
  date: Date;
  monthIndex: number;
  weekIndex: number;
  dayIndex: number;
  day: string;
  daySplit: number;
  name?:string;
  exercises: DayExercise[];
}

export interface WarmupsResponse {
  count: number;
  warmups: Warmup[];
}
export interface Restday extends BaseEntity {
  title: string;
  vimeoId: string;
  description: string;
  equipments: string[];
}
export interface RestdaysResponse {
  count: number;
  restdays: Warmup[];
}
export interface Exercise extends BaseEntity {
  title: string;
  description: string;
  vimeoId: string;
  thumbnail: string;
  videoThumbnail: string;
  guide: string;
  categories: string[];
  tags: string[];
  usedEquipments: string[];
  relatedExercises: string[];
}
export interface ExercisesResponse {
  count: number;
  exercises: Exercise[];
}

export interface Screen extends BaseEntity {
  vimeoId: string;
  imgUrl: string;
}
export interface ScreensResponse {
  vimeoId: string;
  imgUrl: string;
  imageLogin: string,
  imageSignup: string,
  imageForgot: string,
  imageEmailConfirm: string,
  imageDashboard: string,
  imageStreakCalendar: string,
  imageMonthView: string,
  imageToday: string,
  imageTools: string,
  imageExerciseLibrary: string,
  imageGraphs: string,
  imageAchievement: string,
  imageApparel: string,
  imageFAQs: string,
  imageTutorial: string,
  imageSubscription: string,
  imageProfile: string,
  imageMyProfle: string,
  imageSetting: string,
  slides: { title: string, description: string }[];
}

export interface Tutorial extends BaseEntity {
  vimeoId: string;
  thumbnail: string;
  title: string;
  description: string;
}

export interface TutorialResponse {
  count: number;
  tutorials: Tutorial[];
}

export interface VersionResponse {
  android: {
    forceUpdate: boolean;
    version: string;
    showPopUp:boolean;
  };
  ios: {
    forceUpdate: boolean;
    version: string;
    showPopUp:boolean;
  };
  _id: string;
  id: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
  latest_version: string;
  update_title: string;
  update_message: string;
}


export interface PopupinfoResponse {
  vimeoId: string;
  imgUrl: string;
  title: string;
  description: string;
}
export interface NewJoinPopupResponse {
  imgUrl?: any;
  imgUrlTranslations?: Record<string, any>;
  title: string;
  titleTranslations: Record<string, string>;
  description: string;
  descriptionTranslations: Record<string, string>;
  buttonText: string;
  buttonTextTranslations: Record<string, string>;
}
export interface Filters {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  subscription?:string;
  sortOrder?: number;
  filter?: any;
  lastId?: string;
  source?: string
}

export interface TitleFilters {
  filterString: string;
}
export interface TitleResponse {
  title: string;
  id: string;
}
export interface WorkoutsResponse {
  count: number;
  months: Month[];
}
export interface WorkoutsBaseEntity {
  _id?: string;
}
export interface Month extends WorkoutsBaseEntity {
  index?: number;
  title: string;
  description: string;
  vimeoId: string;
  thumbnail: any;
  startDate: Date;
  endDate: Date;
  localId: string;
  weeks: Week[];
}
export interface Week extends WorkoutsBaseEntity {
  index?: number;
  title: string;
  description: string;
  vimeoId: string;
  thumbnail: any;
  restdayId: string;
  localId: string;
  days: Day[];
}
export interface Day extends WorkoutsBaseEntity {
  typeId: number;
  title: string;
  description: string;
  vimeoId: string;
  vimeoIdTwo: string;
  vimeoIdThree: string;
  thumbnail: any;
  thumbnailOne: any;
  thumbnailTwo: any;
  thumbnailThree: any;
  formats: string[];
  localId?: string;
  warmups: DayWarmup[];
  exercises: DayExercise[];
  circuits?: any[];
}
export interface ExtraExercise {
  _id?: string;
  sets: number;
  reps: number;
  weight: number;
  rest: number;
  load: number;
  type: 1 | 2 | 3; // 1: Warm-up set, 2: Back-off set, 3: Normal set
}
export interface DayExercise extends WorkoutsBaseEntity {
  typeId?: number;
  exerciseId: string;
  guide: string;
  sets: number;
  reps: number;
  weight: number;
  rest: number;
  formats?: string[];
  status: string;
  extra: ExtraExercise[];
  localId?: string;
}
export interface DayWarmup extends WorkoutsBaseEntity {
  typeId: number;
  warmupId: string;
  title: string;
  guide: string;
  formats: string[];
  localId?: string;
}

export interface Staff extends BaseEntity {
  title: string;
  location: string;
  photo: string;
  type: number;
  bio: string;
  link: string;
  linkedin:string;
  tiktok:string;
  facebook:string;
  twitter:string;
}
export interface StaffsResponse {
  count: number;
  staffs: Staff[];
}

export interface Challenge extends BaseEntity {
  title: string;
  photo: string;
  description: string;
  isFeatured: boolean;
  isHide: boolean;
  link: string;
  buttonText: string;
  joinedUsers: User[];
}
export interface ChallengesResponse {
  count: number;
  challenges: Challenge[];
}

export type SelectOption = {
  label: string;
  value: string;
}

export interface Section extends BaseEntity {
  title: string;
  description: string;
  vimeoId: string;
  variations: string[];
  formats: string[];
}
export interface SectionsResponse {
  count: number;
  sections: Section[];
}
export interface PumpDaysResponse {
  count: number;
  pumpDays: Day[];
}

export interface Faq extends BaseEntity {
  question: string;
  answer: string;
}
export interface FaqsResponse {
  count: number;
  faqs: Faq[];
}

export interface PhasesMainInfoResponse {
  title: string;
  description: string;
  contenttitle: string;
  thumbnail: string;
}

export interface Phases extends BaseEntity {
  title: string;
  description: string;
  thumbnail: string;
}
export interface PhasesResponse {
  count: number;
  phases: Phases[];
}
export interface ToolsResponse {
  toolsCount: number;
  tools: Tools[];
}
export interface Tools extends BaseEntity {
  title: string;
  titleTranslations:Record<string, string> ;
  toolName: string;
  visible:boolean;
}