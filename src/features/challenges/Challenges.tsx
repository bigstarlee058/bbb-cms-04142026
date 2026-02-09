import { useEffect } from 'react';
import { ContentLayout } from '@/components/Layout';
import { ChallengesList } from './components/ChallengesList';
import { CreateChallenge } from './components/CreateChallenge';
import { useUserStore } from '@/stores/user';
import { useQuery } from 'react-query';
import { Spinner } from '@/components/Elements';
import { LanguageSwitcher, useListTranslations } from '@/components/Language';
import { fetchChallenges } from './api';
export const Challenges = () => {
  const { setCurrentPage } = useUserStore();
  const { data: challengeData, isLoading } = useQuery(['get-challenges'], () => fetchChallenges({}));

  const {
    selectedLang,
    setSelectedLang,
    availableLanguages,
    hasTranslations,
    getValue,
  } = useListTranslations({
    data: challengeData?.challenges,
    translatableFields: ['title', 'photo', 'description', 'buttonText'],
  });

  useEffect(() => {
    setCurrentPage("challenges");
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
        <h2>Challenges</h2>
        <div>
          {hasTranslations && (
            <LanguageSwitcher
              availableLanguages={availableLanguages}
              selectedLang={selectedLang}
              onLanguageChange={setSelectedLang}
            />
          )}
        </div>
        <CreateChallenge />
      </div>
      <div className="mt-4">
        <ChallengesList getValue={getValue} challengeData={challengeData} />
      </div>
    </ContentLayout>
  );
};