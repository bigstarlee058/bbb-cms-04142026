// features/money/components/Upsells.tsx

import { ContentLayout } from '@/components/Layout';
import { UpsellsList } from './UpsellsList';
import { CreateUpsell } from './CreateUpsell';

export const Upsells = () => {
  return (
    <ContentLayout title="">
      <div className="flex justify-end">
        <CreateUpsell />
      </div>
      <div className="mt-4">
        <UpsellsList />
      </div>
    </ContentLayout>
  );
};