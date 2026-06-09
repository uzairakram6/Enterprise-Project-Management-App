import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { cn } from "../ui/utils";

interface DateFieldProps {
  label?: string;
  value?: Date;
  onChange: (date?: Date) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Small, single-purpose date picker used across the project module so the
 * onboarding wizard and settings screens stay consistent and uncluttered.
 */
export function DateField({
  label,
  value,
  onChange,
  placeholder = "Pick a date",
  id,
  className,
  disabled,
}: DateFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "MMM d, yyyy") : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={value} onSelect={onChange} initialFocus />
        </PopoverContent>
      </Popover>
    </div>
  );
}
