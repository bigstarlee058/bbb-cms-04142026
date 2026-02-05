import { useQuery } from 'react-query';
import Vimeo from '@u-wave/react-vimeo';
import { Spinner } from '@/components/Elements';
import { ContentLayout } from '@/components/Layout';
import { ErrorMessage } from '@/types';
import { fetchScreens } from './api';
import { useNotificationStore } from '@/stores/notifications';
import { UpdateScreens } from './UpdateScreens';
import { LanguageSwitcher, useListTranslations } from '@/components/Language';

export const BackgroundScreens = () => {
  const { addNotification } = useNotificationStore();
  const { data, isLoading, error } = useQuery('get-screens', fetchScreens, {
    onError: (err: ErrorMessage) => {
      addNotification({
        type: 'success',
        title: err.message
      });
    }
  });
  const {
    selectedLang,
    setSelectedLang,
    availableLanguages,
    hasTranslations,
    getValue,
  } = useListTranslations({
    data: data ? [data] : [],
    translatableFields: ['title','vimeoId', 'description'],
  });
  if (isLoading ) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <ContentLayout title="">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        <div className="flex justify-between items-center">
          <h2>Background Screens</h2>
          <div>
            {hasTranslations && (
              <LanguageSwitcher
                availableLanguages={availableLanguages}
                selectedLang={selectedLang}
                onLanguageChange={setSelectedLang}
              />
            )}
          </div>
          <UpdateScreens screenData={data} />
        </div>
      </div>
      <ContentLayout title="Welcome Video"><Vimeo className="h-full w-full" video={data.vimeoId} autoplay={false} /></ContentLayout>
      
      <ContentLayout title="Welcome Page Welcome Note">
        <div className="mt-2">
          <div className="flex flex-wrap items-center px-4 py-5 sm:px-6 bg-white shadow-md overflow-hidden sm:rounded-lg">
            {data.slides.map((slide, index) => (
              <div key={index} className="w-full sm:w-1/2 md:w-1/3 p-4">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                  <h3 className="text-md font-semibold text-gray-800 mb-2">{getValue(slide, 'title')}</h3>
                  <p className="text-gray-600">{getValue(slide, 'description')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ContentLayout>
      <ContentLayout title="Screens Background Image">
        <div className="mt-1 flex flex-col space-y-16">
          <div className="flex items-center px-4 py-5 sm:px-6 bg-white shadow overflow-x-auto sm:rounded-lg">
            <div className='flex-shrink-0 flex flex-col items-center text-center mx-2 w-[150px]'>
              <div className='h-[50px] flex items-center justify-center leading-[16px]'>Signin Screen</div>
              <img className="!bg-no-repeat bg-center h-[250px] w-auto" src={data.imageLogin} alt="Thumbnail" />
            </div>
            <div className='flex-shrink-0 flex flex-col items-center text-center mx-2 w-[150px]'>
              <div className='h-[50px] flex items-center justify-center leading-[16px]'>Signup Screen</div>
              <img className="!bg-no-repeat bg-center h-[250px] w-auto" src={data.imageSignup} alt="Thumbnail" />
            </div>
            <div className='flex-shrink-0 flex flex-col items-center text-center mx-2 w-[150px]'>
              <div className='h-[50px] flex items-center justify-center leading-[16px]'>Forgot Password Screen</div>
              <img className="!bg-no-repeat bg-center h-[250px] w-auto" src={data.imageForgot} alt="Thumbnail" />
            </div>
            <div className='flex-shrink-0 flex flex-col items-center text-center mx-2 w-[150px]'>
              <div className='h-[50px] flex items-center justify-center leading-[16px]'>Email confirmation screen</div>
              <img className="!bg-no-repeat bg-center h-[250px] w-auto" src={data.imageEmailConfirm} alt="Thumbnail" />
            </div>
            <div className='flex-shrink-0 flex flex-col items-center text-center mx-2 w-[150px]'>
              <div className='h-[50px] flex items-center justify-center leading-[16px]'>Dashboard screen</div>
              <img className="!bg-no-repeat bg-center h-[250px] w-auto" src={data.imageDashboard} alt="Thumbnail" />
            </div>
            <div className='flex-shrink-0 flex flex-col items-center text-center mx-2 w-[150px]'>
              <div className='h-[50px] flex items-center justify-center leading-[16px]'>Streak calendar screen</div>
              <img className="!bg-no-repeat bg-center h-[250px] w-auto" src={data.imageStreakCalendar} alt="Thumbnail" />
            </div>
            <div className='flex-shrink-0 flex flex-col items-center text-center mx-2 w-[150px]'>
              <div className='h-[50px] flex items-center justify-center leading-[16px]'>Month view screen</div>
              <img className="!bg-no-repeat bg-center h-[250px] w-auto" src={data.imageMonthView} alt="Thumbnail" />
            </div>
            <div className='flex-shrink-0 flex flex-col items-center text-center mx-2 w-[150px]'>
              <div className='h-[50px] flex items-center justify-center'>Day screen</div>
              <img className="!bg-no-repeat bg-center h-[250px] w-auto" src={data.imageToday} alt="Thumbnail" />
            </div>
            <div className='flex-shrink-0 flex flex-col items-center text-center mx-2 w-[150px]'>
              <div className='h-[50px] flex items-center justify-center leading-[16px]'>Tools screen</div>
              <img className="!bg-no-repeat bg-center h-[250px] w-auto" src={data.imageTools} alt="Thumbnail" />
            </div>
            <div className='flex-shrink-0 flex flex-col items-center text-center mx-2 w-[150px]'>
              <div className='h-[50px] flex items-center justify-center leading-[16px]'>Exercise Library screen</div>
              <img className="!bg-no-repeat bg-center h-[250px] w-auto" src={data.imageExerciseLibrary} alt="Thumbnail" />
            </div>
            <div className='flex-shrink-0 flex flex-col items-center text-center mx-2 w-[150px]'>
              <div className='h-[50px] flex items-center justify-center leading-[16px]'>Graphs & Reports screen</div>
              <img className="!bg-no-repeat bg-center h-[250px] w-auto" src={data.imageGraphs} alt="Thumbnail" />
            </div>
            <div className='flex-shrink-0 flex flex-col items-center text-center mx-2 w-[150px]'>
              <div className='h-[50px] flex items-center justify-center leading-[16px]'>Achievements screen</div>
              <img className="!bg-no-repeat bg-center h-[250px] w-auto" src={data.imageAchievement} alt="Thumbnail" />
            </div>
            <div className='flex-shrink-0 flex flex-col items-center text-center mx-2 w-[150px]'>
              <div className='h-[50px] flex items-center justify-center leading-[16px]'>Apparel & Equipment screen</div>
              <img className="!bg-no-repeat bg-center h-[250px] w-auto" src={data.imageApparel} alt="Thumbnail" />
            </div>
            <div className='flex-shrink-0 flex flex-col items-center text-center mx-2 w-[150px]'>
              <div className='h-[50px] flex items-center justify-center leading-[16px]'>FAQ screen</div>
              <img className="!bg-no-repeat bg-center h-[250px] w-auto" src={data.imageFAQs} alt="Thumbnail" />
            </div>
            <div className='flex-shrink-0 flex flex-col items-center text-center mx-2 w-[150px]'>
              <div className='h-[50px] flex items-center justify-center leading-[16px]'>Tutorial screen</div>
              <img className="!bg-no-repeat bg-center h-[250px] w-auto" src={data.imageTutorial} alt="Thumbnail" />
            </div>
            <div className='flex-shrink-0 flex flex-col items-center text-center mx-2 w-[150px]'>
              <div className='h-[50px] flex items-center justify-center leading-[16px]'>Subscription screen</div>
              <img className="!bg-no-repeat bg-center h-[250px] w-auto" src={data.imageSubscription} alt="Thumbnail" />
            </div>
            <div className='flex-shrink-0 flex flex-col items-center text-center mx-2 w-[150px]'>
              <div className='h-[50px] flex items-center justify-center leading-[16px]'>Account screen</div>
              <img className="!bg-no-repeat bg-center h-[250px] w-auto" src={data.imageProfile} alt="Thumbnail" />
            </div>
            <div className='flex-shrink-0 flex flex-col items-center text-center mx-2 w-[150px]'>
              <div className='h-[50px] flex items-center justify-center leading-[16px]'>My Profile screen</div>
              <img className="!bg-no-repeat bg-center h-[250px] w-auto" src={data.imageMyProfle} alt="Thumbnail" />
            </div>
            <div className='flex-shrink-0 flex flex-col items-center text-center mx-2 w-[150px]'>
              <div className='h-[50px] flex items-center justify-center leading-[16px]'>Settings screen</div>
              <img className="!bg-no-repeat bg-center h-[250px] w-auto" src={data.imageSetting} alt="Thumbnail" />
            </div>
          </div>
        </div>
      </ContentLayout>
    </ContentLayout>
  );
};
