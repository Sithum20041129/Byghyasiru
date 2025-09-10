import React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { Command as CommandPrimitive } from 'cmdk';

export function MultiSelect({
  options,
  selected,
  onChange,
  className,
  placeholder = 'Select options...',
  ...props
}) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const inputRef = React.useRef(null);

  const handleSelect = (option) => {
    onChange([...selected, option.value]);
  };

  const handleUnselect = (value) => {
    onChange(selected.filter((s) => s !== value));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue) {
      const option = options.find(opt => opt.label.toLowerCase() === inputValue.toLowerCase());
      if (option && !selected.includes(option.value)) {
        handleSelect(option);
      }
      setInputValue('');
      e.preventDefault();
    }
    if (e.key === 'Backspace' && !inputValue && selected.length > 0) {
      handleUnselect(selected[selected.length - 1]);
    }
  };

  const filteredOptions = options.filter(
    (option) =>
      !selected.includes(option.value) &&
      option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <CommandPrimitive onKeyDown={handleKeyDown} className="overflow-visible bg-transparent">
      <div className="group border border-input rounded-md px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex gap-1 flex-wrap">
          {selected.map((value) => {
            const option = options.find(opt => opt.value === value);
            return (
              <Badge key={value} variant="secondary">
                {option?.label}
                <button
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUnselect(value);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(value)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            );
          })}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && filteredOptions.length > 0 ? (
          <div className="absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandGroup className="h-full overflow-auto">
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onSelect={() => {
                    setInputValue('');
                    handleSelect(option);
                  }}
                  className="cursor-pointer"
                >
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        ) : null}
      </div>
    </CommandPrimitive>
  );
}