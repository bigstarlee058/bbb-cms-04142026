import { Dialog, Menu, Transition } from '@headlessui/react';
import {
  UserIcon,
  HomeIcon,
  MenuAlt1Icon,
  MenuAlt2Icon,
  MenuAlt3Icon,
  MenuAlt4Icon,
  UsersIcon,
  XIcon
} from '@heroicons/react/outline';
import clsx from 'clsx';
import * as React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuthorization, ROLES } from '@/lib/authorization';
import { SearchField } from '../ui/SearchField';
import { useEffect, useState } from 'react';
import { useFilteringStore } from '@/stores/filter';
import { useUserStore } from '@/stores/user';
import ReactSelect from 'react-select';
import reactSelectStylesConfig from '@/lib/react-select';
import logo from '@/assets/bbb-logo.png';
import { useAuthStore } from '@/stores/auth';
import { SaveConfirmation } from '@/features/workouts/components/custom/SaveConfirmation';
import { useWorkoutContext } from '@/features/workouts/WorkoutContext';
import { MonthCover } from '@/features/workouts/components/custom/MonthCover';
import { axios } from '@/lib/axios';
import { ErrorMessage, ResponseMessage } from '@/types';
import { SavePumpDays } from '@/features/pumpdays/SavePumpDays';
import { usePumpDaysContext } from '@/features/pumpdays/PumpDaysContext';

type SideNavigationItem = {
  title: string;
  path: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  submenu: [SideNavigationItem];
};

const SideNavigation = () => {
  const { checkAccess } = useAuthorization();
  const [activeSubmenu, setActiveSubmenu] = useState('');

  const navigation = [
    { title: 'Dashboard', path: '.', icon: HomeIcon },
    checkAccess({ allowedRoles: [ROLES.ADMIN] }) && {
      title: 'Users',
      path: './users',
      icon: UsersIcon
    },
    {
      title: 'Modals',
      icon: MenuAlt1Icon,
      submenu: [
        { title: 'Login Screen Background', path: './backgroundScreens', icon: MenuAlt1Icon },
        { title: 'Tutorial Video', path: './backgroundTutorials', icon: MenuAlt1Icon },
        { title: 'Version Manage', path: './versionManage', icon: MenuAlt1Icon },
        { title: 'Workout day split', path: './popupWorkout', icon: MenuAlt1Icon },
        { title: 'Equipment availability', path: './popupEquipment', icon: MenuAlt1Icon },
      ]
    },

    { title: 'Workouts', path: './workouts', icon: MenuAlt1Icon },
    { title: 'Exercises', path: './exercises', icon: MenuAlt2Icon },
    { title: 'Warm-up', path: './warmups', icon: MenuAlt3Icon },
    { title: 'Equipment', path: './equipments', icon: MenuAlt4Icon },
    { title: 'Rest Days', path: './restdays', icon: MenuAlt4Icon },
    { title: 'Categories', path: './categories', icon: MenuAlt4Icon },
    { title: 'Tags', path: './tags', icon: MenuAlt4Icon },
    { title: 'People', path: './staffs', icon: MenuAlt4Icon },
    { title: 'Challenges', path: './challenges', icon: MenuAlt4Icon },
    { title: 'Collections', path: './collections', icon: MenuAlt4Icon },
    { title: 'Bonuses', path: './bonuses', icon: MenuAlt4Icon },
    { title: 'Program Info', path: './program-info', icon: MenuAlt4Icon },
    { title: 'Pump Days', path: './pumpdays', icon: MenuAlt4Icon },
  ].filter(Boolean) as SideNavigationItem[];

  return (
    <>
      {navigation.map((item, index) => (
        <div key={item.title}>
          {!item.submenu ? (
            <NavLink
              end={index === 0}
              key={item.title}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  'text-gray-300 hover:bg-[#333] hover:text-white',
                  'group flex items-center px-2 py-2 text-base font-medium rounded-md',
                  { 'bg-[#333] text-white': isActive }
                )
              }
            >
              <item.icon
                className={clsx('text-gray-400 group-hover:text-gray-300', 'mr-4 flex-shrink-0 h-6 w-6')}
                aria-hidden="true"
              />
              {item.title}
            </NavLink>
          ) : (
            <>
              <div
                onClick={() => setActiveSubmenu((prev) => (prev === item.title ? '' : item.title))}
                className={clsx(
                  'text-gray-300 hover:bg-[#333] hover:text-white cursor-pointer',
                  'group flex items-center px-2 py-2 text-base font-medium rounded-md'
                )}
              >
                <item.icon
                  className={clsx('text-gray-400 group-hover:text-gray-300', 'mr-4 flex-shrink-0 h-6 w-6')}
                  aria-hidden="true"
                />
                {item.title}
                {/* <ChevronDownIcon className='relative right-0 h-4 w-4 '/> */}
              </div>
              {item?.submenu?.length && activeSubmenu === item.title ? (
                <div className="relative flex flex-col pl-[32px]">
                  {item.submenu.map((subItem) => (
                    <NavLink
                      key={subItem.path}
                      to={subItem.path}
                      className={({ isActive }) => clsx('p-2 w-fit text-white', { 'font-semibold': isActive })}
                    >
                      {subItem.title}
                    </NavLink>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>
      ))}
    </>
  );
};

type UserNavigationItem = {
  title: string;
  path: string;
  onClick?: () => void;
};

const UserNavigation = () => {
  const { user, setIsLogged, setUser } = useAuthStore();
  const signOut = () => {
    //logout();
    setIsLogged(false);
    setUser(null);
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  const userNavigation = [
    { title: 'Your Profile', path: './profile' },
    {
      title: 'Sign out',
      path: '/',
      onClick: () => {
        signOut();
      }
    }
  ].filter(Boolean) as UserNavigationItem[];

  return (
    <Menu as="div" className="ml-3 relative">
      {({ open }) => (
        <>
          <div>
            <Menu.Button className="max-w-xs  bg-gray-200 p-2 flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <span className="sr-only">Open user menu</span>
              <UserIcon className="h-5 w-5 rounded-full" />
            </Menu.Button>
          </div>
          <Transition
            show={open}
            as={React.Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              static
              className="origin-top-right z-30 absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
            >
              {userNavigation.map((item) => (
                <Menu.Item key={item.title}>
                  {({ active }) => (
                    <Link
                      onClick={item.onClick}
                      to={item.path}
                      className={clsx(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                    >
                      {item.title}
                    </Link>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
};

type MobileSidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const MobileSidebar = ({ sidebarOpen, setSidebarOpen }: MobileSidebarProps) => {
  return (
    <Transition.Root show={sidebarOpen} as={React.Fragment}>
      <Dialog as="div" static className="fixed inset-0 flex z-40 md:hidden" open={sidebarOpen} onClose={setSidebarOpen}>
        <Transition.Child
          as={React.Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </Transition.Child>
        <Transition.Child
          as={React.Fragment}
          enter="transition ease-in-out duration-300 transform"
          enterFrom="-translate-x-full"
          enterTo="translate-x-0"
          leave="transition ease-in-out duration-300 transform"
          leaveFrom="translate-x-0"
          leaveTo="-translate-x-full"
        >
          <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-gray-800">
            <Transition.Child
              as={React.Fragment}
              enter="ease-in-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in-out duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
            </Transition.Child>
            <div className="flex-shrink-0 flex items-center px-4">
              <Logo />
            </div>
            <div className="mt-5 flex-1 h-0 overflow-y-auto">
              <nav className="px-2 space-y-1">
                <SideNavigation />
              </nav>
            </div>
          </div>
        </Transition.Child>
        <div className="flex-shrink-0 w-14" aria-hidden="true"></div>
      </Dialog>
    </Transition.Root>
  );
};

const Sidebar = () => {
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 p-5 bg-[#0d0d0d]">
          <div className="flex items-center h-16 flex-shrink-0 px-4" style={{ backgroundColor: 'black' }}>
            <Logo />
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 bg-[#0d0d0d] space-y-1">
              <SideNavigation />
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

const Logo = () => {
  return (
    <Link className="flex items-center text-white m-5 w-24" to=".">
      <img src={logo} alt="BBB logo" />
    </Link>
  );
};

type MainLayoutProps = {
  children: React.ReactNode;
};

const SortOption = [
  // { label: 'Popularity', value: 'Popularity' },
  { label: 'Name: A to Z', value: 'NameAtoZ' },
  { label: 'Name: Z to A', value: 'NameZtoA' },
  { label: 'Newest Added', value: 'NewestAdded' },
  { label: 'Oldest Added', value: 'OldestAdded' }
];

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [monthCover, setMonthCover] = React.useState('');

  const { currentPage } = useUserStore();
  const { setSearchBoxValue, setSortByValue, sortBy } = useFilteringStore();
  const { months } = useWorkoutContext();
  const { days } = usePumpDaysContext();
  const { pathname } = useLocation();

  const handleSortOptionChange = (val: any) => {
    setSortByValue(val.label, val.value);
  };

  const fetchSetting = async () => {
    try {
      const result = await axios.get(`/settings/admin/get`);
      setMonthCover(result[0].monthCover)
      return result;
    } catch (err: any) {
      const error: ErrorMessage = {
        status: true,
        message: err as string
      };
      return Promise.reject(error);
    }
  };

  const onSetMonthCover = async (payload: { image: File }) => {
    try {
      const formData = new FormData();
      formData.append('image', payload.image);

      const result = (await axios.post('/settings/admin', formData)) as ResponseMessage;
      fetchSetting();
      return result.message;
    } catch (err: any) {
      const error: ErrorMessage = {
        status: true,
        message: err as string
      };
      console.log(error);
      return Promise.reject(error);
    }
  };

  useEffect(() => {}, [currentPage]);
  useEffect(() => {
    fetchSetting();
  }, []);

  return (
    <div className="h-screen flex bg-gray-100">
      <MobileSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <MenuAlt2Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div
            className={`flex-1 px-4 flex items-center ${
              currentPage == 'users' ||
              currentPage == 'exercises' ||
              currentPage == 'warmups' ||
              currentPage == 'equipments' ||
              currentPage == 'restdays' ||
              currentPage == 'categories'
                ? 'justify-between'
                : 'justify-end'
            }`}
          >
            {(currentPage == 'users' ||
              currentPage == 'exercises' ||
              currentPage == 'warmups' ||
              currentPage == 'equipments' ||
              currentPage == 'restdays' ||
              currentPage == 'categories') && (
              <div className="flex-1 px-4 flex justify-start items-center">
                <div className="p-1">
                  <SearchField setSearchQuery={(val) => setSearchBoxValue(val)} />
                </div>
                <div className="p-4">
                  <ReactSelect
                    styles={reactSelectStylesConfig}
                    className="w-56 shrink hover:shrink-0 whitespace-nowrap"
                    placeholder="Sort by"
                    name="sortby"
                    options={SortOption}
                    value={sortBy}
                    onChange={handleSortOptionChange}
                  />
                </div>
              </div>
            )}
            <div className="ml-4 flex items-center md:ml-6">
              {pathname.includes('workouts') && (
                <>
                  <MonthCover initialMonthCover={monthCover} onSetMonthCover={onSetMonthCover} />
                  <SaveConfirmation allMonths={months} />
                </>
              )}
              {pathname.includes('pumpdays') && (
                <SavePumpDays allDays={days} />
              )}
              <UserNavigation />
            </div>
          </div>
        </div>
        <main className="flex-1 relative overflow-y-auto focus:outline-none">{children}</main>
      </div>
    </div>
  );
};
