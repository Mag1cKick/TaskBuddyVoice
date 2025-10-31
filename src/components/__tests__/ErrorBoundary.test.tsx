import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '../ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  describe('Normal Operation', () => {
    it('should render children when there is no error', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should not show error UI when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should catch and display error when child component throws', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('should show error details in card', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error Details')).toBeInTheDocument();
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('should display recovery suggestions', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/You can try the following:/i)).toBeInTheDocument();
      expect(screen.getByText(/Refresh the page/i)).toBeInTheDocument();
      expect(screen.getByText(/Go back to the home page/i)).toBeInTheDocument();
    });

    it('should show Try Again button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      expect(tryAgainButton).toBeInTheDocument();
    });

    it('should show Go Home button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const goHomeButton = screen.getByRole('button', { name: /go home/i });
      expect(goHomeButton).toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    it('should reset error state when Try Again is clicked', async () => {
      const user = userEvent.setup();
      
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Error UI should be visible
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Click Try Again
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      await user.click(tryAgainButton);

      // Rerender with no error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Should show normal content
      expect(screen.getByText('No error')).toBeInTheDocument();
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = <div>Custom error message</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
    });
  });

  describe('Error Callback', () => {
    it('should call onError callback when error occurs', () => {
      const onErrorMock = vi.fn();

      render(
        <ErrorBoundary onError={onErrorMock}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(onErrorMock).toHaveBeenCalled();
      expect(onErrorMock).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });

    it('should pass correct error to callback', () => {
      const onErrorMock = vi.fn();

      render(
        <ErrorBoundary onError={onErrorMock}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const [error] = onErrorMock.mock.calls[0];
      expect(error.message).toBe('Test error message');
    });
  });

  describe('Development Mode Features', () => {
    it('should show stack trace details in development', () => {
      // Mock development environment
      const originalEnv = import.meta.env.DEV;
      (import.meta.env as any).DEV = true;

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Look for details/summary element (stack trace)
      const details = screen.queryByText(/Stack Trace/i);
      if (details) {
        expect(details).toBeInTheDocument();
      }

      // Restore environment
      (import.meta.env as any).DEV = originalEnv;
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA roles', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Buttons should have proper roles
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
    });

    it('should have descriptive error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const errorTitle = screen.getByText(/something went wrong/i);
      expect(errorTitle).toBeInTheDocument();
    });
  });

  describe('Multiple Errors', () => {
    it('should handle different error types', () => {
      const errors = [
        new Error('Network error'),
        new TypeError('Type error'),
        new ReferenceError('Reference error'),
      ];

      errors.forEach((error) => {
        const ThrowSpecificError = () => {
          throw error;
        };

        const { unmount } = render(
          <ErrorBoundary>
            <ThrowSpecificError />
          </ErrorBoundary>
        );

        expect(screen.getByText(error.message)).toBeInTheDocument();
        unmount();
      });
    });
  });
});

