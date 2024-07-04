import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { auth, firebaseErrorString } from '@/utils/firebase';
import { UserCredential, User } from 'firebase/auth';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { queryClient } from '@/lib/react-query';
import storage from '@/utils/storage';
import { ResponseMessage } from '@/types';
import { axios } from '@/lib/axios';

interface AuthUser extends User {
  role: string;
}

interface AuthContextProps {
  user?: AuthUser;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        //storage.setToken(JSON.stringify(user));
        setUser({ ...user, role: 'ADMIN' });
      } else {
        setUser(undefined);
      }
    });
    return () => unsubscribe();
  }, []);

  const value: AuthContextProps = {
    user: user ? { ...user, role: 'ADMIN' } : undefined,
    signIn: async (email, password) => {
      const isAdmin = (await axios.post('/users/signin_admin', { email })) as ResponseMessage;
      if (isAdmin.result === false) {
        return Promise.reject({ message: 'Only admins can access to this site.' });
      }
      return signInWithEmailAndPassword(auth, email, password)
        .then((data) => {
          if (!data.user.emailVerified) {
            return Promise.reject({ message: 'Email is not verified yet.' });
          }
          //storage.setToken(JSON.stringify(data.user));
        })
        .catch(function (error) {
          const errString = firebaseErrorString(error);
          return Promise.reject(errString);
        });
    },
    signOut: () => {
      value.user = undefined;
      //storage.clearToken();
      signOut(auth);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
