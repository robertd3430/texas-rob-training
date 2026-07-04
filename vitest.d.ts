// jest-axe only ships type augmentations for jest's expect; this project
// uses vitest's own Assertion interface, so toHaveNoViolations needs its
// own declaration merge here.
import 'vitest';

interface AxeMatchers<R = unknown> {
  toHaveNoViolations(): R;
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- declaration merge, not a real empty interface
  interface Assertion<T = unknown> extends AxeMatchers<T> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- declaration merge, not a real empty interface
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
