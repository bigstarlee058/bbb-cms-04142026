import { PlusIcon, TrashIcon } from '@heroicons/react/outline';
import { useFormik } from 'formik';
import { useMutation } from 'react-query';

import { Button } from '@/components/Elements';
import { FormDrawer, Field, Textarea, Select } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useNotificationStore } from '@/stores/notifications';
import { createPumpDaySchema } from '@/utils/yup';

import { createPumpDay } from '../api';
import { Circuit } from '@/types';

interface FormikState {
  title: string;
  description: string;
  vimeoId: string;
  circuits: { round: number; circuitId: string }[];
}

export const CreatePumpDay = ({titles}) => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(createPumpDay, {
    onSuccess: (message: string) => {
      formik.resetForm();
      addNotification({
        type: 'success',
        title: message
      });
    }
  });

  const circuitTitles = titles || [];

  const initialValues: FormikState = {
    title: '',
    description: '',
    vimeoId: '',
    circuits: [{ round: 0, circuitId: '' }]
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createPumpDaySchema,
    onSubmit: (v) => onSubmit(v)
  });
  const onSubmit = (value: any) => {
    mutate(value);
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
        triggerButton={
          <Button size="sm" variant="danger" startIcon={<PlusIcon className="h-4 w-4" />}>
            Create Pump Day
          </Button>
        }
        title="Create Pump Day"
        submitButton={
          <Button form="create-pump-day" variant="danger" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="create-pump-day" onSubmit={formik.handleSubmit}>
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
