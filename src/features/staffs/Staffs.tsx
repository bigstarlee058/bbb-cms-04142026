import { useEffect } from 'react';
import { ContentLayout } from '@/components/Layout';
import { StaffsList } from './components/StaffsList';
import { CreateStaff } from './components/CreateStaff';
import { useUserStore } from '@/stores/user';
import { useQuery } from 'react-query';
import { Spinner } from '@/components/Elements';
import { LanguageSwitcher, useListTranslations } from '@/components/Language';
import { fetchStaffs } from './api';
export const Staffs = () => {
  const { setCurrentPage } = useUserStore();
  const { data: staffData, isLoading } = useQuery(['get-staffs'], () => fetchStaffs({}));

  const {
    selectedLang,
    setSelectedLang,
    availableLanguages,
    hasTranslations,
    getValue,
  } = useListTranslations({
    data: staffData?.staffs,
    translatableFields: ['title', 'bio'],
  });

  useEffect(() => {
    setCurrentPage("staffs");
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <ContentLayout title="">
      <div className="flex justify-between items-center">
        <h2>Staffs</h2>
        <div>
          {hasTranslations && (
            <LanguageSwitcher
              availableLanguages={availableLanguages}
              selectedLang={selectedLang}
              onLanguageChange={setSelectedLang}
            />
          )}
        </div>
        <CreateStaff />
      </div>
      <div className="mt-4">
        <StaffsList getValue={getValue} staffData={staffData} />
      </div>
    </ContentLayout>
  );
};