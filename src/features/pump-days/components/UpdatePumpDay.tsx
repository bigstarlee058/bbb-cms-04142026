import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { Field, FormDrawer, Dropzone, Textarea, Select } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation } from 'react-query';
import { updatePumpDay } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createPumpDaySchema } from '@/utils/yup';
import { PlusIcon, TrashIcon } from '@heroicons/react/outline';

interface FormikState {
  title: string;
  description: string;
  vimeoId: string;
  circuits: { round: number; circuitId: string }[];
}

export const UpdatePumpDay = ({ pumpDayId, pumpDays, titles }) => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(updatePumpDay, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message
      });
    }
  });

  const circuitTitles = titles || [];

  const pumpDayData = pumpDays.pumpDays.find((ex) => ex._id === pumpDayId);

  const initialValues: FormikState = {
    title: pumpDayData?.title || '',
    description: pumpDayData?.description || '',
    vimeoId: pumpDayData?.vimeoId || '',
    circuits: pumpDayData?.circuits || [{ round: 0, circuitId: '' }],
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createPumpDaySchema,
    onSubmit: (v) => onSubmit(v)
  });
  const onSubmit = (state: FormikState) => {
    const { title, description, vimeoId, circuits } = state;
    mutate({ pumpDayId, title, description, vimeoId, circuits });
  };

  const onAddCircuit = () => {
    if (formik.values.circuits.length === 3) return;
    const newCircuit = [...formik.values.circuits, { round: 0, circuitId: '' }];
    formik.setFieldValue('circuits', newCircuit);
  };

  const onDeleteCircuit = (index: number) => {
    const newCircuit = formik.values.circuits.filter((_, i) => i !== index);
    formik.setFieldValue('circuits', newCircuit);
  };

  const getCircuit = (circuitId: string) => {
    const circuit = circuitTitles?.find((circuit) => circuit._id === circuitId);
    return { label: circuit?.title || '', value: circuitId };
  }

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={<Button variant="danger" startIcon={<PencilIcon className="h-4 w-4" />} />}
        title="Update Pump Day"
        submitButton={
          <Button form="update-pump-day" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-pump-day" onSubmit={formik.handleSubmit}>
          <Field label="Name" formik={formik} name="title" />
          <Textarea label="Description" formik={formik} name="description" />
          <Field label="vimeoId" formik={formik} name="vimeoId" />
          <div className="flex justify-between items-end">
            <label className="fieldLabel">Circuits</label>
            <Button
              variant="danger"
              name="add slide"
              startIcon={<PlusIcon className="h-6 w-4" />}
              onClick={onAddCircuit}
            />
          </div>
          {(formik.values.circuits ?? []).map((_circuit, index) => (
            <div key={index} className="p-4 bg-gray-200 rounded shadow-md mt-4">
              <div className="flex justify-between items-end">
                <label className="fieldLabel">Circuit</label>
                <Button
                  variant="danger"
                  startIcon={<TrashIcon className="h-4 w-4" />}
                  onClick={() => onDeleteCircuit(index)}
                ></Button>
              </div>
              <Field label="Round" type="number" formik={formik} name={`circuits[${index}].round`} />
              <Select
                formik={formik}
                label="Circuit Name"
                name="circuit"
                options={circuitTitles?.map(({ title, id }) => ({ label: title, value: id })) || []}
                value={{
                  label: getCircuit(formik.values.circuits[index].circuitId).label,
                  value: getCircuit(formik.values.circuits[index].circuitId).value
                }}
                onChange={({value}: any) =>
                  formik.setFieldValue(
                    `circuits[${index}].circuitId`,
                    value
                  )
                }
              />
            </div>
          ))}
        </form>
      </FormDrawer>
    </Authorization>
  );
};
