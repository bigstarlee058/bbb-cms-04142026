import { ContentLayout } from '@/components/Layout';
import { ToolsList } from './components/ToolsList';
import { CreateTool } from './components/CreateTool';
export const Tools = () => {
  return (
    <ContentLayout title="">
      <div className="flex justify-end">
        <CreateTool />
      </div>
      <div className="mt-4">
        <ToolsList />
      </div>
    </ContentLayout>
  );
};