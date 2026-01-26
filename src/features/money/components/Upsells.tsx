import { ContentLayout } from '@/components/Layout';
import { UpsellsList } from './UpsellsList';
import { CreateUpsell } from './CreateUpsell';
import { upsellApi } from '../api';
import { LanguageSwitcher, useListTranslations } from '@/components/Language';
import { useQuery } from 'react-query';
export const Upsells = () => {
  const { data: upsellsData, isLoading } = useQuery(['upsells'], upsellApi.getAll);
  const {
    selectedLang,
    setSelectedLang,
    availableLanguages,
    hasTranslations,
    getValue,
  } = useListTranslations({
    data: upsellsData?.data,
    translatableFields: ["title", "subtitle", "description", "image"],
  });
  if (isLoading) {
    return (<>Getting the Available Upsells</>)
  }
  return (
    <ContentLayout title="">
      <div className="flex justify-between items-center">
        <h2>Upsells</h2>
        <div>
          {hasTranslations && (
            <LanguageSwitcher
              availableLanguages={availableLanguages}
              selectedLang={selectedLang}
              onLanguageChange={setSelectedLang}
            />
          )}
        </div>
        <CreateUpsell />
      </div>
      <div className="mt-1">
        <UpsellsList getValue={getValue} />
      </div>
    </ContentLayout>
  );
};