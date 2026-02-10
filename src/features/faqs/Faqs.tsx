import { useEffect } from 'react';
import { ContentLayout } from '@/components/Layout';
import { FaqsList } from './components/FaqsList';
import { CreateFaq } from './components/CreateFaq';
import { useUserStore } from '@/stores/user';
import { useQuery } from 'react-query';
import { Spinner } from '@/components/Elements';
import { LanguageSwitcher, useListTranslations } from '@/components/Language';
import { fetchFaqs } from './api';

export const Faqs = () => {
  const { setCurrentPage } = useUserStore();
  const { data: faqsData, isLoading } = useQuery(['get-faqs'], () => fetchFaqs({}));

  const {
    selectedLang,
    setSelectedLang,
    availableLanguages,
    hasTranslations,
    getValue,
  } = useListTranslations({
    data: faqsData?.faqs,
    translatableFields: ['question', 'answer'],
  });

  useEffect(() => {
    setCurrentPage("faqs");
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
        <h2>FAQs</h2>
        <div>
          {hasTranslations && (
            <LanguageSwitcher
              availableLanguages={availableLanguages}
              selectedLang={selectedLang}
              onLanguageChange={setSelectedLang}
            />
          )}
        </div>
        <CreateFaq />
      </div>
      <div className="mt-4">
        <FaqsList getValue={getValue} faqsData={faqsData} />
      </div>
    </ContentLayout>
  );
};