import { ContentLayout } from '@/components/Layout';
import { CreateCategory } from './components/CreateCategory';
import { CategoriesList } from './components/CategoriesList';
import { useQuery } from 'react-query';
import { fetchCategories } from './api';
import { LanguageSwitcher, useListTranslations } from '@/components/Language';
export const Categories = () => {
  const {
    data,
    isLoading,
  } = useQuery(['get-categories'], () => fetchCategories({}));
  const {
    selectedLang,
    setSelectedLang,
    availableLanguages,
    hasTranslations,
    getValue,
  } = useListTranslations({
    data: data?.categories ? data?.categories : [],
    translatableFields: ['title'],
  });
  if (isLoading) {
    return (<>Getting the Available Categories</>)
  }
  return (
    <ContentLayout title="">
      <div className="flex justify-between items-center">
        <h2>Categories</h2>
        <div>
          {hasTranslations && (
            <LanguageSwitcher
              availableLanguages={availableLanguages}
              selectedLang={selectedLang}
              onLanguageChange={setSelectedLang}
            />
          )}
          </div>
          <CreateCategory />
        </div>
        <div className="mt-2">
          <CategoriesList getValue={getValue} />
        </div>
    </ContentLayout>
  );
};
