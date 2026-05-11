import '@testing-library/jest-dom/vitest'

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof window !== 'undefined') {
  const originalGetComputedStyle = window.getComputedStyle.bind(window)
  window.getComputedStyle = ((element: Element) =>
    originalGetComputedStyle(element)) as typeof window.getComputedStyle

  if (!window.matchMedia) {
    window.matchMedia = () =>
      ({
        matches: false,
        media: '',
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
      } as MediaQueryList)
  }

  if (!window.ResizeObserver) {
    window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver
  }
}
