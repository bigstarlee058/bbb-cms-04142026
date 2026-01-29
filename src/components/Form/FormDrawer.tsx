import * as React from 'react';

import { useDisclosure } from '@/hooks/useDisclosure';

import { Button } from '../Elements/Button';
import { Drawer, DrawerProps } from '../Elements/Drawer';

type FormDrawerProps = {
  isDone: boolean;
  triggerButton: React.ReactElement;
  submitButton: React.ReactElement;
  title: string;
  children: React.ReactNode;
  size?: DrawerProps['size'];
  onClose?: () => void;
};

export const FormDrawer = ({
  title,
  children,
  isDone,
  triggerButton,
  submitButton,
  size = 'md',
  onClose,
}: FormDrawerProps) => {
  const { close, open, isOpen } = useDisclosure();
  const handleClose = React.useCallback(() => {
    close();
    onClose?.();
  }, [close, onClose]);
  React.useEffect(() => {
    if (isDone) {
      close();
    }
  }, [isDone, close]);

  return (
    <>
      {React.cloneElement(triggerButton, { onClick: open })}
      <Drawer
        isOpen={isOpen}
        onClose={handleClose}
        title={title}
        size={size}
        renderFooter={() => (
          <>
            <Button variant="inverse" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            {submitButton}
          </>
        )}
      >
        {children}
      </Drawer>
    </>
  );
};
