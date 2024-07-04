import { useNavigate } from 'react-router';

import cressey from '@/assets/bbb.jpg';
import logo from '@/assets/bbb-logo.png';
import { Button } from '@/components/Elements';
import { Head } from '@/components/Head';
import { useAuth } from '@/lib/auth';

export const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <>
      <Head description="Welcome to bulletproof react" />
      <div className="bg-bbb h-[100vh] flex items-center">
        <div className="max-w-7xl mx-auto text-center py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="w-full flex justify-center mb-10">
            <img width={200} height={100} src={logo} alt="react" />
          </div>
          <div className="w-full flex justify-center mb-10">
            <img width={300} height={150} className="rounded-2xl" src={cressey} alt="react" />
          </div>
          <p className='text-white'>
            Booty By Bret has rapidly established itself as a go-to high performance
            facility among Boston athletes - and those that come from across the country and abroad
            to experience BBB's cutting-edge methods.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-md shadow">
              <Button
                onClick={() => {
                  if (user) {
                    navigate('/app');
                  } else {
                    navigate('/auth/login');
                  }
                }}
                startIcon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                }
              >
                Get started Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
