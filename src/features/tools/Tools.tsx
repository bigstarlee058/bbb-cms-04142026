import { ContentLayout } from '@/components/Layout';
import { ToolsList } from './components/ToolsList';

export const Tools = () => {
  return (
    <ContentLayout title="">
      <div className="mt-4">
        <ToolsList />
      </div>
    </ContentLayout>
  );
};