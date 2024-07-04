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
  link: string;
  price: number;
}
export interface EquipmentPayload {
  title: string;
  thumbnail: string;
  link: string;
  price: number;
}
export interface Exercise extends BaseEntity {
  title: string;
  description: string;
  vimeoId: string;
  thumbnail: string;
  categories?: string[];
  collections?: string[];
  equipments?: string[];
  difficulty?: number;
  popularity?: number;
}
export interface ExercisePayload {
  title: string;
  description: string;
  vimeoId: string;
  thumbnail: string;
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
