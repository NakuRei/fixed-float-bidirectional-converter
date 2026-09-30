import { type RefObject, useEffect } from 'react';

export function useOutsideClick<T extends HTMLElement>(
  ref: RefObject<T>,
  callback: () => void,
): void {
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent): void => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return (): void => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [ref, callback]);
}
