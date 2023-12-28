import { Dispatch, SetStateAction, useState } from 'react';

/**
 * Stores a value in localStorage.
 * Source: https://usehooks.com/useLocalStorage
 *
 * @param key Name of key for which the value is stored in localStorage
 * @param initialValue Initial value stored for the key in localStorage
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): readonly [[T, Dispatch<SetStateAction<T>>][0], (value: ((val: T) => T) | T) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue
      }
      // Get from local storage by key
      const item = window.localStorage.getItem(key)
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      // If error also return initialValue
      console.log(error)
      return initialValue
    }
  })
  // Return a wrapped version of useState's setter function that persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      if (typeof window === 'undefined') {
        return
      }
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      // Save state
      setStoredValue(valueToStore)
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.log(error)
    }
  }
  return [storedValue, setValue] as const
}