import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as any

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any

// Mock Web Speech API
const SpeechRecognitionMock = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  abort: vi.fn(),
  continuous: false,
  interimResults: false,
  lang: 'en-US',
  onstart: null,
  onend: null,
  onresult: null,
  onerror: null,
}))

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: SpeechRecognitionMock,
})

Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: SpeechRecognitionMock,
})

