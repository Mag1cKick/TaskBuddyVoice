import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Type for import.meta.env to allow dynamic property assignment
type ImportMetaEnv = Record<string, string | boolean | undefined>;

describe('Environment Configuration', () => {
  const originalEnv = { ...import.meta.env };

  beforeEach(() => {
    // Reset modules to ensure fresh imports
    vi.resetModules();
  });

  afterEach(() => {
    // Restore original environment
    Object.keys(import.meta.env).forEach(key => {
      delete (import.meta.env as ImportMetaEnv)[key];
    });
    Object.assign(import.meta.env, originalEnv);
  });

  describe('getEnvConfig', () => {
    it('should return config when all required variables are set', async () => {
      // Set required environment variables
      (import.meta.env as ImportMetaEnv).VITE_SUPABASE_URL = 'https://test.supabase.co';
      (import.meta.env as ImportMetaEnv).VITE_SUPABASE_ANON_KEY = 'test-key-' + 'a'.repeat(100);

      const { getEnvConfig } = await import('../env');
      const config = getEnvConfig();

      expect(config).toBeDefined();
      expect(config.supabase.url).toBe('https://test.supabase.co');
      expect(config.supabase.anonKey).toContain('test-key');
    });

    it('should throw error when VITE_SUPABASE_URL is missing', async () => {
      (import.meta.env as ImportMetaEnv).VITE_SUPABASE_URL = '';
      (import.meta.env as ImportMetaEnv).VITE_SUPABASE_ANON_KEY = 'test-key';

      const { getEnvConfig } = await import('../env');
      
      expect(() => getEnvConfig()).toThrow('Missing required environment variable: VITE_SUPABASE_URL');
    });

    it('should throw error when VITE_SUPABASE_ANON_KEY is missing', async () => {
      (import.meta.env as ImportMetaEnv).VITE_SUPABASE_URL = 'https://test.supabase.co';
      (import.meta.env as ImportMetaEnv).VITE_SUPABASE_ANON_KEY = '';

      const { getEnvConfig } = await import('../env');
      
      expect(() => getEnvConfig()).toThrow('Missing required environment variable: VITE_SUPABASE_ANON_KEY');
    });

    it('should throw error for invalid Supabase URL', async () => {
      (import.meta.env as ImportMetaEnv).VITE_SUPABASE_URL = 'not-a-valid-url';
      (import.meta.env as ImportMetaEnv).VITE_SUPABASE_ANON_KEY = 'test-key-' + 'a'.repeat(100);

      const { getEnvConfig } = await import('../env');
      
      expect(() => getEnvConfig()).toThrow('Invalid VITE_SUPABASE_URL');
    });
  });

  describe('isDevelopment', () => {
    it('should return true in development mode', async () => {
      (import.meta.env as ImportMetaEnv).DEV = true;
      (import.meta.env as ImportMetaEnv).PROD = false;
      (import.meta.env as ImportMetaEnv).VITE_SUPABASE_URL = 'https://test.supabase.co';
      (import.meta.env as ImportMetaEnv).VITE_SUPABASE_ANON_KEY = 'test-key-' + 'a'.repeat(100);

      vi.resetModules();
      const { isDevelopment } = await import('../env');
      
      expect(isDevelopment()).toBe(true);
    });

    it('should return false in production mode', async () => {
      (import.meta.env as ImportMetaEnv).DEV = false;
      (import.meta.env as ImportMetaEnv).PROD = true;
      (import.meta.env as ImportMetaEnv).VITE_SUPABASE_URL = 'https://test.supabase.co';
      (import.meta.env as ImportMetaEnv).VITE_SUPABASE_ANON_KEY = 'test-key-' + 'a'.repeat(100);

      vi.resetModules();
      const { isDevelopment } = await import('../env');
      
      expect(isDevelopment()).toBe(false);
    });
  });

  describe('isProduction', () => {
    it('should return true in production mode', async () => {
      (import.meta.env as ImportMetaEnv).DEV = false;
      (import.meta.env as ImportMetaEnv).PROD = true;
      (import.meta.env as ImportMetaEnv).VITE_SUPABASE_URL = 'https://test.supabase.co';
      (import.meta.env as ImportMetaEnv).VITE_SUPABASE_ANON_KEY = 'test-key-' + 'a'.repeat(100);

      vi.resetModules();
      const { isProduction } = await import('../env');
      
      expect(isProduction()).toBe(true);
    });

    it('should return false in development mode', async () => {
      (import.meta.env as ImportMetaEnv).DEV = true;
      (import.meta.env as ImportMetaEnv).PROD = false;
      (import.meta.env as ImportMetaEnv).VITE_SUPABASE_URL = 'https://test.supabase.co';
      (import.meta.env as ImportMetaEnv).VITE_SUPABASE_ANON_KEY = 'test-key-' + 'a'.repeat(100);

      vi.resetModules();
      const { isProduction } = await import('../env');
      
      expect(isProduction()).toBe(false);
    });
  });

  describe('URL Validation', () => {
    it('should accept valid Supabase URLs', async () => {
      const validUrls = [
        'https://abc.supabase.co',
        'https://my-project.supabase.co',
        'https://test-123.supabase.co',
      ];

      for (const url of validUrls) {
        (import.meta.env as ImportMetaEnv).VITE_SUPABASE_URL = url;
        (import.meta.env as ImportMetaEnv).VITE_SUPABASE_ANON_KEY = 'test-key-' + 'a'.repeat(100);

        vi.resetModules();
        const { getEnvConfig } = await import('../env');
        
        expect(() => getEnvConfig()).not.toThrow();
      }
    });

    it('should reject invalid URLs', async () => {
      // Test URLs that will actually fail URL parsing
      const invalidUrls = [
        'not-a-url',
        'invalid url with spaces',
        '',
      ];

      for (const url of invalidUrls) {
        (import.meta.env as ImportMetaEnv).VITE_SUPABASE_URL = url;
        (import.meta.env as ImportMetaEnv).VITE_SUPABASE_ANON_KEY = 'test-key-' + 'a'.repeat(100);

        vi.resetModules();
        const { getEnvConfig } = await import('../env');
        
        expect(() => getEnvConfig()).toThrow();
      }
    });
  });

  describe('Key Validation', () => {
    it('should accept keys of sufficient length', async () => {
      (import.meta.env as ImportMetaEnv).VITE_SUPABASE_URL = 'https://test.supabase.co';
      (import.meta.env as ImportMetaEnv).VITE_SUPABASE_ANON_KEY = 'a'.repeat(150);

      const { getEnvConfig } = await import('../env');
      
      expect(() => getEnvConfig()).not.toThrow();
    });

    it('should warn about short keys', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      (import.meta.env as ImportMetaEnv).VITE_SUPABASE_URL = 'https://test.supabase.co';
      (import.meta.env as ImportMetaEnv).VITE_SUPABASE_ANON_KEY = 'short';

      const { getEnvConfig } = await import('../env');
      getEnvConfig();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('VITE_SUPABASE_ANON_KEY seems unusually short')
      );

      consoleSpy.mockRestore();
    });
  });
});

