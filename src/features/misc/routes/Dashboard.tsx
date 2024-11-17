import { ContentLayout } from '@/components/Layout';
import { useAuthStore }  from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import { useEffect } from 'react';

export const Dashboard = () => {
  const { user } = useAuthStore();
  const { setCurrentPage } = useUserStore();

  useEffect(() => {
    setCurrentPage("dashboard");
  }, []);

  return (
    <ContentLayout title="Dashboard">
      <h1 className="text-xl mt-2">Welcome {user?.email}</h1>
      <h4 className="my-3">
        Your role is : <b>{user?.role == 1 ? "ADMIN":"USER"}</b>
      </h4>
      <p className="font-medium">Your current permissions:</p>
      {user?.role === 0 && (
        <ul className="my-4 list-inside list-disc">
          <li>Tag management</li>
        </ul>
      )}
      {user?.role === 1 && (
        <ul className="my-4 list-inside list-disc">
          {/* <li>Intro Video management</li> */}
          <li>User management</li>
          <li>Exercise management</li>
          {/* <li>Quiz management</li>
          <li>Tag management</li>
          <li>Category management</li>
          <li>Collection management</li>
          <li>Exercise management</li>
          <li>Shop Equipment management</li> */}
        </ul>
      )}
    </ContentLayout>
  );
};
