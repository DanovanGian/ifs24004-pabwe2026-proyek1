export function useInput(initialValue = '') {
  let value = initialValue;

  function onChange(e: Event) {
    const target = e.target as HTMLInputElement;
    value = target ? target.value : '';
  }

  function reset() {
    value = initialValue;
  }

  return {
    get value() {
      return value;
    },
    set value(v: string) {
      value = v;
    },
    onChange,
    reset,
  };
}
