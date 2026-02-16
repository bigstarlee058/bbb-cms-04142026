import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Button } from '@/components/Elements';
import { ExclamationIcon } from '@heroicons/react/outline';

type LockDialogProps = {
  isOpen: boolean;
  type: 'contested' | 'lost';
  lockedBy: { id: string; name: string } | null;
  onViewOnly: () => void;
  onTakeOver: () => void;
};

export const LockDialog = ({
  isOpen,
  type,
  lockedBy,
  onViewOnly,
  onTakeOver,
}: LockDialogProps) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationIcon
                      className="h-6 w-6 text-red-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      {type === 'contested'
                        ? 'Workout is Locked'
                        : 'Editing Lock Lost'}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {type === 'contested' && lockedBy
                          ? `"${lockedBy.name}" is currently editing the workouts. Taking over will discard their unsaved changes.`
                          : type === 'lost' && lockedBy
                            ? `"${lockedBy.name}" has taken over editing. Your unsaved changes may be lost.`
                            : type === 'lost'
                              ? 'Another admin has taken over editing. Your unsaved changes may be lost.'
                              : 'Another admin is currently editing the workouts.'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  {type === 'contested' && (
                    <Button
                      type="button"
                      className="bg-red-600 hover:bg-red-700 ml-3"
                      onClick={onTakeOver}
                    >
                      Take Over
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="inverse"
                    onClick={onViewOnly}
                  >
                    View Only
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};