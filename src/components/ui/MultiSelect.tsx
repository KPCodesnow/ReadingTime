import React from 'react';
import Select, { Props as SelectProps } from 'react-select';

export interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps extends Omit<SelectProps<Option, true>, 'value' | 'onChange'> {
  value: Option[];
  onChange: (value: Option[]) => void;
  maxItems?: number;
}

export function MultiSelect({ 
  value, 
  onChange, 
  maxItems, 
  ...props 
}: MultiSelectProps) {
  return (
    <Select<Option, true>
      {...props}
      isMulti
      value={value}
      onChange={(newValue) => {
        if (maxItems && newValue.length > maxItems) {
          return;
        }
        onChange(newValue as Option[]);
      }}
      styles={{
        control: (base) => ({
          ...base,
          borderColor: 'var(--border-color, #e2e8f0)',
          '&:hover': {
            borderColor: 'var(--border-hover-color, #cbd5e1)',
          },
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected 
            ? 'var(--primary-color, #3b82f6)' 
            : state.isFocused 
              ? 'var(--focus-color, #e2e8f0)' 
              : undefined,
          ':active': {
            backgroundColor: 'var(--active-color, #bfdbfe)',
          },
        }),
        multiValue: (base) => ({
          ...base,
          backgroundColor: 'var(--tag-color, #e2e8f0)',
        }),
        multiValueLabel: (base) => ({
          ...base,
          color: 'var(--tag-text-color, #1e293b)',
        }),
        multiValueRemove: (base) => ({
          ...base,
          ':hover': {
            backgroundColor: 'var(--tag-remove-hover, #cbd5e1)',
            color: 'var(--tag-remove-color, #ef4444)',
          },
        }),
      }}
      className="react-select-container"
      classNamePrefix="react-select"
    />
  );
} 