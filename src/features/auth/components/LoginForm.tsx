import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from 'react-query';
import { fetchMe } from '@/features/users';
import { USER_ADMIN, User } from '@/features/users/types';
import { Button } from '@/components/Elements';
import { Field } from '@/components/Form';
import { login } from '@/features/auth/api/auth';
import { useAuthStore } from '@/stores/auth';
import { userLoginSchema } from '@/utils/yup';
import { useNotificationStore } from '@/stores/notifications';
import { ErrorMessage } from '@/types';

interface FormikState {
  email: string;
  password: string;
}

type LoginFormProps = {
  onSuccess: () => void;
};

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const { mutate } = useMutation(login);
  const navigate = useNavigate();
  const { user, setUser, setIsLogged, isLogged } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    console.log("this is login page", user);
    if(user) {
      navigate('/app');
    }
  }, [user, navigate]);

  const initialValues: FormikState = {
    email: '',
    password: '',
  };

  const formik = useFormik({
    initialValues,
    validationSchema: userLoginSchema,
    onSubmit: async (values) => {
      setLoading(true);
      mutate(values, {
        onSuccess: async (resp: { success: boolean; data: { uid: string; _id: string }; message?: string }) => {
          setLoading(false);
          if (resp.success) {
            setIsLogged(true);
            const newUser = await fetchMe();
            if(newUser?.role == 1) {
              console.log("this is login page success", user);
              setUser(newUser);
              navigate('/app');
              // onSuccess();
            } else {
              setIsLogged(false);
              localStorage.clear();
              sessionStorage.clear();
              window.location.href = '/';
            }
          } else {
            console.log("Error", resp.message || "Unexpected Error");
          }
        },
        onError: (err: ErrorMessage) => {
          addNotification({
            type: 'success',
            title: err.message
          });
          setLoading(false);
        }
      });
    }
  });

  return (
    <div>
      <form id="login-form" onSubmit={formik.handleSubmit}>
        <Field label="Email Address" formik={formik} type='email' name="email" />
        <Field type="password" label="Password" formik={formik} name="password" />
        <Button isLoading={loading} size='md' type="submit" variant='danger' className="mt-6 w-full rounded-full">
          Log in
        </Button>
      </form>
    </div>
  );
}
