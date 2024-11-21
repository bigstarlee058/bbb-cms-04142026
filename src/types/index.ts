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
  tags: Tag[];
}
export interface CollectionPayload {
  title: string;
  thumbnail: string;
  tags: string[];
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
export interface User extends BaseEntity {
  workoutsHistory: UserWorkout[];
  name: string;
  email: string;
  role: number;
}
export interface UsersResponse {
  count: number;
  users: User[];
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
}
export interface UserWorkout extends BaseEntity {
  workoutId: string;
  date: Date;
  monthIndex: number;
  weekIndex: number;
  dayIndex: number;
  day: string;
  daySplit: number;
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
  guide: string;
  categories: string[];
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
  description: string;
}

export interface Filters {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: number;
  filter?: any;
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

  weeks: Week[];
}
export interface Week extends WorkoutsBaseEntity {
  index?: number;
  title: string;
  description: string;
  vimeoId: string;
  thumbnail: any;
  restdayId: string;

  days: Day[];
}
export interface Day extends WorkoutsBaseEntity {
  typeId: number;
  title: string;
  description: string;
  vimeoId: string;
  thumbnail: any;
  formats: string[];
  
  warmups: DayWarmup[];
  exercises: DayExercise[];
}
export interface ExtraExercise {
  sets: number;
  reps: number;
  weight: number;
  rest: number;
  load: number;
  type: 1 | 2; // 1: Warm up, 2: Back set
}
export interface DayExercise extends WorkoutsBaseEntity {
  typeId: number;
  exerciseId: string;
  guide: string;
  sets: number;
  reps: number;
  weight: number;
  rest: number;
  formats: string[];
  status: string;
  extra: ExtraExercise[];
}
export interface DayWarmup extends WorkoutsBaseEntity {
  typeId: number;
  warmupId: string;
  title: string;
  guide: string;
  formats: string[];
}

export interface Staff extends BaseEntity {
  title: string;
  photo: string;
  type: number;
  bio: string;

}
export interface StaffsResponse {
  count: number;
  staffs: Staff[];
}

export interface Challenge extends BaseEntity {
  title: string;
  photo: string;
  description: string;
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