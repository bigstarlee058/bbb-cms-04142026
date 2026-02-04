import { lazy, Suspense, useState } from 'react';
import { Spinner } from '@/components/Elements';
import { ContentLayout } from '@/components/Layout';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const SubscriptionChart = lazy(() => import('../SubscriptionChart'));
import { LanguageManager } from './LangaugeManager';
export const Dashboard = () => {
  const { user, setUser, setIsLogged } = useAuthStore();
  const navigate = useNavigate();
  const { setCurrentPage } = useUserStore();
  const [showChart, setShowChart] = useState(false);
  useEffect(() => {
    if (user.role != 1) {
      setIsLogged(false);
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    } else {
      setCurrentPage("dashboard");
      const timer = setTimeout(() => {
        setShowChart(true);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  return (
    <ContentLayout title="">
      <div className="p-2 bg-white h-full w-[100%]">
        <div className="flex gap-4 items-stretch">
          <div className="flex-1">

            <h1>Dashboard</h1>
            <h1 className="text-xl mt-2">Welcome {user?.email}</h1>
            <h4 className="my-3">
              Your role is : <b>{user?.role == 1 ? 'ADMIN' : 'USER'}</b>
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
          </div>
          <div className="flex-1">
            <Suspense fallback={<div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>}>
              <LanguageManager />
            </Suspense>
          </div>
        </div>

        {user?.role === 1 && (
          <div className="mt-6">
            {showChart ? (
              <Suspense fallback={<div className="flex justify-center items-center h-[600px]"><Spinner size="xl" /></div>}>
                <SubscriptionChart />
              </Suspense>
            ) : (
              <div className="flex justify-center items-center h-[600px]"><Spinner size="xl" /></div>
            )}
          </div>
        )}
      </div>
    </ContentLayout>
  );
};
