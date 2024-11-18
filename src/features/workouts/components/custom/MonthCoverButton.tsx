import { Button } from '@/components/Elements';
import { useMonthCoverContext } from '../../MonthCoverContext';

const MonthCoverButton = () => {
  const { onSetCount } = useMonthCoverContext();

  return (
    <Button variant="danger" type="button" className="mr-2" onClick={onSetCount}>
      Default Month Cover
    </Button>
  );
};

export default MonthCoverButton;
