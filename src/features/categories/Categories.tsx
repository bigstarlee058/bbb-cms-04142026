import { ContentLayout } from '@/components/Layout';
import { CreateCategory } from './components/CreateCategory';
import { CategoriesList } from './components/CategoriesList';

export const Categories = () => {
  return (
    <ContentLayout title="">
      <div className="flex justify-end">
        <CreateCategory />
      </div>
      <div className="mt-4">
        <CategoriesList />
      </div>
    </ContentLayout>
  );
};
