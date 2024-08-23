import * as React from 'react';

import logo from '@/assets/bbb-logo.png';
import { Link } from '@/components/Elements';
import { Head } from '@/components/Head';

type LayoutProps = {
  children: React.ReactNode;
  title: string;
};

export const Layout = ({ children, title }: LayoutProps) => {
  return (
    <>
      <Head title={title} />
      <div style={{ backgroundColor: 'black' }} className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Link className="flex items-center text-white" to="/">
              <img className="w-48" src={logo} alt="Workflow" />
            </Link>
          </div>
          <h2 className="mt-3 text-center text-3xl font-extrabold text-gray-900">{title}</h2>
        </div>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">{children}</div>
        </div>
      </div>
    </>
  );
};
