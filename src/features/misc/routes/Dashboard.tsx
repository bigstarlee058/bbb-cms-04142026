import { ContentLayout } from '@/components/Layout';
import { useAuthStore }  from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const { user, setUser, setIsLogged } = useAuthStore();
  const navigate = useNavigate();
  const { setCurrentPage } = useUserStore();
  useEffect(() => {
    console.log("this is dashboard page", user.role);
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
