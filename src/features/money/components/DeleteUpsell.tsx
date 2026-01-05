import { TrashIcon } from '@heroicons/react/outline';
import { useMutation, useQueryClient } from 'react-query';
import { Button, ConfirmationDialog } from '@/components/Elements';
import { useNotificationStore } from '@/stores/notifications';
import { upsellApi } from '../api';
import { Authorization, ROLES } from '@/lib/authorization';

export const DeleteUpsell = ({ id }: { id: string }) => {
    const { addNotification } = useNotificationStore();
    const queryClient = useQueryClient();

    const { mutate, isLoading, isSuccess } = useMutation(
        () => upsellApi.delete(id),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('upsells');
                addNotification({
                    type: 'success',
                    title: 'Upsell deleted successfully.',
                });
            },
        }
    );

    return (
        <Authorization allowedRoles={[ROLES.ADMIN]}>
            <ConfirmationDialog
                isDone={isSuccess}
                triggerButton={
                    <Button variant="danger" startIcon={<TrashIcon className="h-4 w-4" />} />
                }
                confirmButton={
                    <Button variant="danger" size="sm" isLoading={isLoading} onClick={() => mutate()}>
                        Delete
                    </Button>
                }
                title="Delete Upsell"
                body="Are you sure you want to delete this upsell? This action cannot be undone."
                icon="danger"
            />
        </Authorization>
    );
};