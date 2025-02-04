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
    console.log("this is dashboard page", user.role);
    if (user.role != 1) {
      setIsLogged(false);
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
      // window.location.href = '/';
    } else {
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
            // const newUser: User = {
            //   uid: resp.data.uid,
            //   _id: resp.data._id,
            //   email: values.email,
            //   name: 'Admin User', // Ensure this aligns with your logic
            //   role: USER_ADMIN,  // Ensure this aligns with your logic
            // };
            const newUser = await fetchMe();
            // useQuery('me', fetchMe, {
            //   enabled: isLogged,
            //   onSuccess: setUser,
            //   onError: () => {
            //     setIsLogged(false);
            //   },
            // });
            setUser(newUser);
            onSuccess();
            // navigate('/app');
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
