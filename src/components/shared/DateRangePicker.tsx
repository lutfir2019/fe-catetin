import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateRangePickerProps {
  start?: string;
  end?: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
}

export function DateRangePicker({ start, end, onStartChange, onEndChange }: DateRangePickerProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className="grid gap-1">
        <Label>Dari tanggal</Label>
        <Input type="date" value={start ?? ""} onChange={(event) => onStartChange(event.target.value)} />
      </label>
      <label className="grid gap-1">
        <Label>Sampai tanggal</Label>
        <Input type="date" value={end ?? ""} onChange={(event) => onEndChange(event.target.value)} />
      </label>
    </div>
  );
}
