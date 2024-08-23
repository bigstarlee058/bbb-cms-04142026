import { Transition } from "@headlessui/react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/outline";
import { XIcon } from "@heroicons/react/solid";
import { Fragment, useEffect } from "react";

// Define the NotificationProps type
export type NotificationProps = {
  notification: {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message?: string;
  };
  onDismiss: (id: string) => void;
};

// Notification component definition without destructuring
export const Notification = (props: NotificationProps) => {
  const id = props.notification.id;
  const type = props.notification.type;
  const title = props.notification.title;
  const message = props.notification.message;

  useEffect(() => {
    const timer = setTimeout(() => props.onDismiss(id), 5000);
    return () => clearTimeout(timer);
  }, [id, props]);

  // Determine which icon to use based on the type
  const getIcon = () => {
    if (type === 'info') {
      return <InformationCircleIcon className="h-6 w-6 text-blue-500" aria-hidden="true" />;
    } else if (type === 'success') {
      return <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />;
    } else if (type === 'warning') {
      return <ExclamationCircleIcon className="h-6 w-6 text-yellow-500" aria-hidden="true" />;
    } else if (type === 'error') {
      return <XCircleIcon className="h-6 w-6 text-red-500" aria-hidden="true" />;
    }
  }

  return (
    <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
      <Transition
        show={true}
        as={Fragment}
        enter="transform ease-out duration-300 transition ease-in-out"
        enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enterTo="translate-y-0 opacity-100 sm:translate-x-0"
        leave="transition ease-in duration-500 ease-in-out"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
          <div className="p-4" role="alert" aria-label={title}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getIcon()}
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-gray-900">{title}</p>
                <p className="mt-1 text-sm text-gray-500">{message}</p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => {
                    props.onDismiss(id);
                  }}
                >
                  <span className="sr-only">Close</span>
                  <XIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  );
};
