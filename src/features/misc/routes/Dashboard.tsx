import { ContentLayout } from '@/components/Layout';
import { useAuthStore }  from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubscriptionChart from '../SubscriptionChart';
export const Dashboard = () => {
  const { user, setUser, setIsLogged } = useAuthStore();
  const navigate = useNavigate();
  const { setCurrentPage } = useUserStore();
  useEffect(() => {
    if (user.role != 1) {
      setIsLogged(false);
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    } else {
      setCurrentPage("dashboard");
    }
  }, [user, navigate]);

  return (
    <ContentLayout title="">
      <div className="p-2  bg-white h-full w-[100%] ">
        <h1>Dashboard</h1>
        <h1 className="text-xl mt-2">Welcome {user?.email}</h1>
        <h4 className="my-3">
          Your role is : <b>{user?.role == 1 ? "ADMIN" : "USER"}</b>
        </h4>
        <p className="font-medium">Your current permissions:</p>
        {user?.role === 0 && (
          <ul className="my-4 list-inside list-disc">
            <li>Tag management</li>
          </ul>
        )}
        {user?.role === 1 && (
          <ul className="my-4 list-inside list-disc">
            <li>User management</li>
            <li>Exercise management</li>
          </ul>
        )}
        {user?.role === 1 && (
          <div className="">
            <SubscriptionChart />
          </div>
        )}
      </div>
    </ContentLayout>
  );
};
