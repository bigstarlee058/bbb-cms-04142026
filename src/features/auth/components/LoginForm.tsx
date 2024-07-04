import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/Elements';
import { Field } from '@/components/Form';
import { useAuth } from '@/lib/auth';
import { useNotificationStore } from '@/stores/notifications';
import { userLoginSchema } from '@/utils/yup';

interface FormikState {
  email: string;
  password: string;
}

type LoginFormProps = {
  onSuccess: () => void;
};

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const [loading, SetLoading] = useState(false);
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (user) {
      navigate('/app');
    }
  }, [user]);

  const initialValues: FormikState = {
    email: '',
    password: '',
  };
  const formik = useFormik({
    initialValues,
    validationSchema: userLoginSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = async (value: any) => {
    SetLoading(true);
    signIn(value.email, value.password)
      .then(() => {
        onSuccess();
      })
      .catch((e) => {
        addNotification({
          type: 'error',
          title: 'Error',
          message: e.message,
        });
        SetLoading(false);
      });
  };

  return (
    <div>
      <form id="login-form" onSubmit={formik.handleSubmit}>
        <Field label="Email Address" formik={formik} name="email" />
        <Field type="password" label="Password" formik={formik} name="password" />
        <Button isLoading={loading} type="submit" className="mt-6 w-full">
          Log in
        </Button>
      </form>
    </div>
  );
};
