import { ContentLayout } from '@/components/Layout';
import { CreateTutorial } from './components/CreateTutorial';
import { TutorialsList } from './components/TutorialsList';
import { LanguageSwitcher, useListTranslations } from '@/components/Language';
import { Spinner, } from '@/components/Elements';
import { fetchTutorials } from './api';
import { useQuery } from 'react-query';
export const Tutorials = () => {
  const { data: tutorialData, isLoading } = useQuery(['get-tutorials'],() => fetchTutorials({}));
  const {
    selectedLang,
    setSelectedLang,
    availableLanguages,
    hasTranslations,
    getValue,
  } = useListTranslations({
    data: tutorialData?.tutorials,
    translatableFields: ['title','description','vimeoId','image'],
  });
  if (isLoading) {
      return (
        <div className="w-full h-48 flex justify-center items-center">
          <Spinner size="lg" />
        </div>
      );
    }
  
  if (!tutorialData) return null;
  return (
    <ContentLayout title="">
      <div className=" flex justify-between items-center">
        <h2>Tutorials</h2>
        <div>
          {hasTranslations && (
            <LanguageSwitcher
              availableLanguages={availableLanguages}
              selectedLang={selectedLang}
              onLanguageChange={setSelectedLang}
            />
          )}
        </div>
        <CreateTutorial />
      </div>
      <div className="mt-1">
        <TutorialsList getValue={getValue}/>
      </div>
    </ContentLayout>
  );
};