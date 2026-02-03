import { useEffect, useState } from 'react';
import { ContentLayout } from '@/components/Layout';
import { fetchEquipments } from './api';
import {  Spinner, } from '@/components/Elements';
import { CreateEquipment } from './components/CreateEquipment';
import { EquipmentList } from './components/EquipmentList';
import { useUserStore } from '@/stores/user';
import { useQuery } from 'react-query';
import { fetchCollectionTitles } from '../workouts/api';
import { LanguageSwitcher, useListTranslations } from '@/components/Language';
import { useFilteringStore } from '@/stores/filter';
import { Filters } from '@/types';
export const Equipments = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { search, sortBy } = useFilteringStore();
  const [filters, setFilters] = useState<Filters>({
    perPage: 10,
    page: 1,
  });

  const { setCurrentPage: setGlobalPage } = useUserStore();

  const { data: titles } = useQuery('get-collection-titles', () =>
    fetchCollectionTitles({ filterString: '' })
  );

  const {
    data: equipmentData,
    isLoading,
  } = useQuery(['get-equipment', filters], () => fetchEquipments(filters), {
    keepPreviousData: true,
  });

  useEffect(() => {
    setFilters((prev) => ({ ...prev, page: currentPage }));
  }, [currentPage]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: search, page: 1 }));
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, sortBy: sortBy?.value, page: 1 }));
    setCurrentPage(1);
  }, [sortBy?.value]);

  useEffect(() => {
    setGlobalPage("equipments");
  }, []);

  const data = equipmentData?.equipments || [];

  const {
    selectedLang,
    setSelectedLang,
    availableLanguages,
    hasTranslations,
    getValue,
  } = useListTranslations({
    data: data,
    translatableFields: ['title', 'description', 'link'],
  });

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
        <h2>Equipment</h2>
        <div>
          {hasTranslations && (
            <LanguageSwitcher
              availableLanguages={availableLanguages}
              selectedLang={selectedLang}
              onLanguageChange={setSelectedLang}
            />
          )}
        </div>
        <CreateEquipment titles={titles} />
      </div>
            <div className="mt-1 max-w-8xl">
        <EquipmentList 
          getValue={getValue}
          equipmentData={equipmentData}
          titles={titles}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </ContentLayout>
  );
};
