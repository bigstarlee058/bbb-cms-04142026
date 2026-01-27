import { ContentLayout } from '@/components/Layout';
import { CreateTag } from './components/CreateTag';
import { TagsList } from './components/TagsList';
import { LanguageSwitcher, useListTranslations } from '@/components/Language';
import { fetchTags } from './api';
import { useQuery } from 'react-query';
export const Tags = () => {
  const {
    data: tagData,
    isLoading,
    refetch,
  } = useQuery(['get-tags'], () => fetchTags({}));
  const { selectedLang, setSelectedLang, availableLanguages, hasTranslations, getValue } =
    useListTranslations({
      data: tagData?.tags,
      translatableFields: ['title'],
    });
if (isLoading){
  return <>Getting the Available Tags</>
}
  return (
    <ContentLayout title="">
      <div className="flex justify-between items-center">
        <h2>Tags</h2>
        <div>
          {hasTranslations && (
            <LanguageSwitcher
              availableLanguages={availableLanguages}
              selectedLang={selectedLang}
              onLanguageChange={setSelectedLang}
            />
          )}
        </div>
        <CreateTag />
      </div>
      <div className="mt-2">
        <TagsList  getValue={getValue} />
      </div>
    </ContentLayout>
  );
};