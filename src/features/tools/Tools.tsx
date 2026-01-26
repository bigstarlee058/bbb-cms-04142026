import { ContentLayout } from '@/components/Layout';
import { ToolsList } from './components/ToolsList';
import { CreateTool } from './components/CreateTool';
import { LanguageSwitcher, useListTranslations } from '@/components/Language';
import { useQuery } from 'react-query';
import { fetchTools } from './api';
export const Tools = () => {
  const { data: toolsData } = useQuery(['get-tools'], fetchTools);

  const { selectedLang, setSelectedLang, availableLanguages, hasTranslations, getValue } =
    useListTranslations({
      data: toolsData?.tools,
      translatableFields: ['title'],
    });

  return (
    <ContentLayout title="">
      <div className="flex justify-between items-center">
        <h2>Tools</h2>
        <div>
          {hasTranslations && (
            <LanguageSwitcher
              availableLanguages={availableLanguages}
              selectedLang={selectedLang}
              onLanguageChange={setSelectedLang}
            />
          )}
        </div>
        <CreateTool />
      </div>
      <div className="mt-1">
        <ToolsList getValue={getValue} />
      </div>
    </ContentLayout>
  );
};