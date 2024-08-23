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
export type User = {
  firstname: string;
  lastname: string;
  email: string;
  role: number;
} & BaseEntity;
export interface UserPayload {
  firstname?: string | null;
  lastname?: string | null;
}
export interface UsersResponse {
  count: number;
  users: User[];
}

export interface Tag extends BaseEntity {
  name: string;
  featuredCollections: Collection[];
}
export interface TagPayload {
  name: string;
  featuredCollections: string[];
}
export interface Category extends BaseEntity {
  title: string;
  count: number;
  thumbnail: string;
}
export interface CategoryPayload {
  title: string;
  thumbnail: string;
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
  categories: string[];
  guide: string;
  relatedExercises: string[];
}
export interface ExercisesResponse {
  count: number;
  exercises: Exercise[];
}
export interface Quiz extends BaseEntity {
  title: string;
  level: number;
}
export interface QuizPayload {
  title: string;
  level: number;
}

export interface VimeoType extends BaseEntity {
  vimeoId: string;
}
export interface VimeoPayload {
  vimeoId: string;
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
export interface WarmupTitleResponse {
  title: string;
  id: string;
}
export interface ExerciseTitleResponse {
  title: string;
  id: string;
}
export interface EquipmentTitleResponse {
  title: string;
  id: string;
}
export interface DayExercise {
  typeId: number;
  id: string;
  guide: string;
  sets: number;
  reps: number;
  weight: number;
  rest: number;
  formats: string[];
}

export interface DayWarmup {
  typeId: number;
  id: string;
  title: string;
  guide: string;
  formats: string[];
}

export interface Day {
  typeId: number;
  title: string;
  description: string;
  vimeoId: string;
  thumbnail: any;
  formats: string[];
  
  warmups: DayWarmup[];
  exercises: DayExercise[];
}

export interface Week {
  title: string;
  description: string;
  vimeoId: string;
  thumbnail: any;
  startDate: Date;
  endDate: Date;

  days: Day[];
}

export interface Month {
  index: number;
  title: string;
  description: string;
  vimeoId: string;
  thumbnail: any;

  weeks: Week[];
}

export interface WorkoutsResponse {
  count: number;
  months: Month[];
}