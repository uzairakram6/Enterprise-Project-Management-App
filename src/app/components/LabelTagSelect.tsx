import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Plus, Tag } from "lucide-react";
import { cn } from "./ui/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { normalizeLabelTag } from "../data/tasks";

interface LabelTagSelectProps {
  value: string[];
  onChange: (tags: string[]) => void;
  availableTags: string[];
  onCreateTag: (tag: string) => void;
  placeholder?: string;
  className?: string;
}

export default function LabelTagSelect({
  value,
  onChange,
  availableTags,
  onCreateTag,
  placeholder = "Label tags",
  className,
}: LabelTagSelectProps) {
  const [open, setOpen] = useState(false);
  const [newTag, setNewTag] = useState("");

  const normalizedValue = useMemo(
    () => [...new Set(value.map(normalizeLabelTag).filter(Boolean))],
    [value],
  );

  const sortedTags = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const tag of availableTags) {
      const normalized = normalizeLabelTag(tag);
      if (!normalized || seen.has(normalized)) continue;
      seen.add(normalized);
      ordered.push(normalized);
    }
    for (const tag of normalizedValue) {
      if (!seen.has(tag)) {
        seen.add(tag);
        ordered.push(tag);
      }
    }
    return ordered;
  }, [availableTags, normalizedValue]);

  const toggleTag = (tag: string) => {
    const normalized = normalizeLabelTag(tag);
    if (normalizedValue.includes(normalized)) {
      onChange(normalizedValue.filter((t) => t !== normalized));
    } else {
      onChange([...normalizedValue, normalized]);
    }
  };

  const handleCreateTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    const normalized = normalizeLabelTag(trimmed);
    onCreateTag(normalized);
    if (!normalizedValue.includes(normalized)) {
      onChange([...normalizedValue, normalized]);
    }
    setNewTag("");
  };

  const triggerLabel =
    normalizedValue.length === 0
      ? placeholder
      : normalizedValue.length === 1
        ? normalizedValue[0]
        : `${normalizedValue.length} tags selected`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-8 justify-between text-xs font-normal px-2.5",
            normalizedValue.length === 0 && "text-muted-foreground",
            className,
          )}
        >
          <span className="flex items-center gap-1.5 truncate">
            <Tag className="w-3 h-3 shrink-0 opacity-60" />
            <span className="truncate">{triggerLabel}</span>
          </span>
          <ChevronsUpDown className="w-3 h-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        <div className="max-h-[240px] overflow-y-auto p-1">
          {sortedTags.map((tag) => {
            const checked = normalizedValue.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs hover:bg-accent"
                onClick={() => toggleTag(tag)}
              >
                <Checkbox checked={checked} className="pointer-events-none" />
                <span className="flex-1 text-left truncate">{tag}</span>
                {checked && <Check className="w-3 h-3 shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>
        <div className="border-t p-2 space-y-1.5">
          <p className="text-[10px] text-muted-foreground px-0.5">Create new tag</p>
          <div className="flex gap-1">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Tag name"
              className="h-7 text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreateTag();
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-7 px-2 shrink-0"
              onClick={handleCreateTag}
              disabled={!newTag.trim()}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
