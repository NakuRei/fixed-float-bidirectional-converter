import React, { useState, useRef } from 'react';

import { CaretDown } from '@phosphor-icons/react';

import { useOutsideClick } from '../hooks/useOutsideClick';

interface DropdownProps<T> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  getOptionLabel: (option: T) => string;
  className?: string;
}

export function CustomDropdown<T>({
  options,
  value,
  onChange,
  getOptionLabel,
  className,
}: DropdownProps<T>): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useOutsideClick(dropdownRef, () => {
    if (isOpen) {
      setIsOpen(false);
    }
  });

  function toggleDropdown(): void {
    setIsOpen(!isOpen);
  }

  function handleOptionClick(
    e: React.MouseEvent<HTMLButtonElement>,
    option: T,
  ): void {
    e.preventDefault();
    onChange(option);
    setIsOpen(false);
  }

  return (
    <div
      className={['relative inline-block', 'w-full h-full', className].join(
        ' ',
      )}
      ref={dropdownRef}
    >
      <div className="w-full">
        <button
          type="button"
          className={[
            'w-full h-fit',
            'inline-flex justify-between items-center',
            'px-4 py-2',
            'rounded-md',
            'border-2',
            'border-primary-700',
            'bg-primary-container bg-opacity-20',
            'text-on-background',
            'focus:border-on-primary-container focus:outline-none',
            'focus:shadow-lg focus:shadow-on-primary-container/20',
            'focus:bg-background-950',
            'focus:ring-2 focus:ring-primary-700 focus:ring-opacity-20',
            'transition duration-300 focus:duration-0 ease-in-out',
          ].join(' ')}
          onClick={toggleDropdown}
          title={getOptionLabel(value)}
        >
          <span className="text-base truncate mr-2">
            {getOptionLabel(value)}
          </span>
          <CaretDown size={16} weight="bold" className="flex-shrink-0" />
        </button>
      </div>

      {isOpen && (
        <div
          className={[
            'w-full max-h-60 overflow-auto',
            'absolute left-0 right-0',
            'z-10',
            'rounded-md',
            'bg-background-800',
          ].join(' ')}
        >
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            {options.map((option, index) => (
              <button
                key={index}
                className={[
                  'w-full h-fit',
                  'block',
                  'px-4 py-2',
                  'text-on-background hover:text-primary',
                  'hover:bg-background hover:bg-opacity-50',
                  'text-left truncate',
                ].join(' ')}
                role="menuitem"
                onClick={(e) => {
                  handleOptionClick(e, option);
                }}
                title={getOptionLabel(option)}
              >
                {getOptionLabel(option)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
