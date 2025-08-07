import { Button, ConfirmationDialog } from "@/components/Elements";
import { Authorization, ROLES } from "@/lib/authorization";
import { updateWorkouts } from '@/features/workouts/api';
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNotificationStore } from "@/stores/notifications";
import SaveIcon from "@/lib/icons/SaveIcon";
import { ArrowNarrowUpIcon } from "@heroicons/react/solid";
import { fetchAllUsers } from "../../api";
import { useState } from "react";
import { Filters, User } from "@/types";
import { saveAs } from 'file-saver';
import Papa from 'papaparse';


export const ExportData = () => {
  // Access the client
    const queryClient = useQueryClient();
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { addNotification } = useNotificationStore();

  const handleExportData = async () => {
    console.log("test::");
    setIsLoading(true);
    const usersList = await fetchAllUsers();
    exportToCSV(usersList)
    setIsLoading(false);
    setIsSuccess(true);
    console.log(usersList);
  };

    const exportToCSV = (users: User[]) => {
        const csvData = users.map(user => ({
            name: user.name,
            email: user.email,
            uid: user.uid,
            registerType: user.uid === "-1" ? "Mobile" : "Wordpress",
            createAt: user.createdAt,
            subscription: user.subscription?.user_subscription_status || '',
            paydate: user.subscription?.purchase_date || '',
            subscriptionType: user.subscription?.subscription_type || '',
            price: user.subscription?.price || '',
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'user_list.csv');
    };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <ConfirmationDialog
        icon="danger"
        title={`Export User List`}
        body={`Are you sure you want to Export User List Data?`}
        isDone={isSuccess}
        triggerButton={
          <Button variant="danger" startIcon={<SaveIcon className="mr-2" width="20" height="20" />}>Export</Button>
        }
        confirmButton={
          <Button
            variant="danger"
            type="button"
            onClick={handleExportData}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Export
          </Button>
        }
      />
    </Authorization>
  )
}