import { render } from '@testing-library/svelte';
import type { ComponentType } from 'svelte';

export function renderWithProviders(component: ComponentType<any>, props = {}) {
  return render(component, { props });
}
