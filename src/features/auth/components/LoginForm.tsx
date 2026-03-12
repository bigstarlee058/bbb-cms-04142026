import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import { fetchMe } from '@/features/users';
import { Button } from '@/components/Elements';
import { Field } from '@/components/Form';
import { login } from '@/features/auth/api/auth';
import { useAuthStore } from '@/stores/auth';
import { userLoginSchema } from '@/utils/yup';
import { useNotificationStore } from '@/stores/notifications';
import { ErrorMessage } from '@/types';
import storage from '@/utils/storage';

interface FormikState {
  email: string;
  password: string;
}

export const LoginForm = () => {
  const { mutate } = useMutation(login);
  const navigate = useNavigate();
  const { setUser, setIsLogged, isLogged } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotificationStore();
  
  const initialValues: FormikState = {
    email: '',
    password: '',
  };

  useEffect(() => {
    if (isLogged) {
      navigate('/app', { replace: true });
    }
  }, [isLogged, navigate]);

  const formik = useFormik({
    initialValues,
    validationSchema: userLoginSchema,
    onSubmit: async (values) => {
      setLoading(true);
      mutate(values, {
        onSuccess: async (resp: any) => {
          setLoading(false);
          
          if (resp.success) {
            if (resp.data?.token) {
               storage.setToken(resp.data.token);
            }
            
            const newUser = await fetchMe();
            if(newUser?.role == 1) {
              setIsLogged(true);
              setUser(newUser);
              navigate('/app');
            } else {
              localStorage.clear();
              sessionStorage.clear();
              window.location.href = '/';
            }
          }
        },
        onError: (err: ErrorMessage) => {
          addNotification({
            type: 'error',
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
