import { Quiz, ErrorMessage, ResponseMessage } from '@/types';
import { db_firestore, storage } from '@/utils/firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  deleteDoc,
  getDocs,
  DocumentData,
  query,
  updateDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { axios } from '@/lib/axios';
import { queryClient } from '@/lib/react-query';

export const fetchQuizzes = async () => {
  try {
    const quizzes = (await axios.get('/quizzes')) as Quiz[];
    quizzes.sort((a: Quiz, b: Quiz) => {
      if (a.level > b.level) return 1;
      if (a.level < b.level) return -1;
      return 0;
    });
    return quizzes;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const fetchQuiz = async (quizId: string) => {
  try {
    const result = (await axios.get(`/quizzes/${quizId}`)) as Quiz;
    return result;
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};

export const createQuiz = async (payload: { title: string; level: number }) => {
  try {
    const newQuiz = {
      ...payload,
      createdAt: Date.now(),
    };
    const result = (await axios.post('/quizzes', newQuiz)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries('get-quizzes');
      return 'Quiz successfully created.';
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

export const updateQuiz = async ({
  quizId,
  payload,
}: {
  quizId: string;
  payload: { title: string; level: number };
}) => {
  try {
    const updatedQuiz = {
      ...payload,
      _id: quizId,
      updatedAt: Date.now(),
    };
    const result = (await axios.put('/quizzes', updatedQuiz)) as ResponseMessage;
    if (result.result === true) {
      queryClient.invalidateQueries(['get-quiz', quizId]);
      return 'Quiz successfully updated.';
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

export const deleteQuiz = async (quizId: string) => {
  try {
    const result = (await axios.delete(`/quizzes/${quizId}`)) as ResponseMessage;
    if (result.result === true) {
      return 'Successfully deleted.';
    }
    return Promise.reject(result.message);
  } catch (err: any) {
    const error: ErrorMessage = {
      status: true,
      message: err as string,
    };
    return Promise.reject(error);
  }
};
