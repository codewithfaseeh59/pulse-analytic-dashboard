import { RANGE_OPTIONS, type RangeDays } from '../../types';
import { SegmentedControl } from '../ui/SegmentedControl/SegmentedControl';

interface DateRangeSelectorProps {
  value: RangeDays;
  onChange: (value: RangeDays) => void;
}

const OPTIONS = RANGE_OPTIONS.map((days) => ({ value: days, label: `${String(days)} days` }));

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <SegmentedControl label="Date range" options={OPTIONS} value={value} onChange={onChange} />
  );
}
