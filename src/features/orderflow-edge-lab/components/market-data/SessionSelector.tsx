import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SessionSelectorProps {
  sessionDates: string[]; // "YYYY-MM-DD", ascending
  selected: string;
  onChange: (date: string) => void;
}

const SessionSelector = ({ sessionDates, selected, onChange }: SessionSelectorProps) => {
  return (
    <Select value={selected} onValueChange={onChange}>
      <SelectTrigger className="w-[160px] text-xs h-8">
        <SelectValue placeholder="Session" />
      </SelectTrigger>
      <SelectContent>
        {[...sessionDates].reverse().map((date) => (
          <SelectItem key={date} value={date} className="text-xs">
            {new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SessionSelector;
