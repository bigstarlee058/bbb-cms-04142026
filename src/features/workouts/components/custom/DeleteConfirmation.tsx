import { Button, ConfirmationDialog } from "@/components/Elements";
import { Authorization, ROLES } from "@/lib/authorization";
import { TrashIcon } from "@heroicons/react/outline";
import { useMutation } from "react-query";

export const DeleteConfirmation = ({deleteFunction, name}) => {
  const { mutate, isSuccess } = useMutation(deleteFunction);
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <ConfirmationDialog
        icon="danger"
        title={`Delete ${name}`}
        body={`Are you sure you want to delete this ${name.toLowerCase()}?`}
        isDone={isSuccess}
        triggerButton={
          <Button variant="danger" startIcon={<TrashIcon className="h-4 w-4" />}></Button>
        }
        confirmButton={
          <Button
            variant="danger"
            type="button"
            onClick={async () => {
              await mutate(deleteFunction);
            }}
          >
            Delete
          </Button>
        }
      />
    </Authorization>
  )
}