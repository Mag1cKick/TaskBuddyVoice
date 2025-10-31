/**
 * Environment Variable Validation
 * 
 * This module validates that all required environment variables are present
 * and provides helpful error messages if they're missing.
 */

interface EnvConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
}

class EnvValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvValidationError';
  }
}

function validateEnvVar(name: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new EnvValidationError(
      `Missing required environment variable: ${name}\n\n` +
      `Please ensure you have a .env file with the following variables:\n` +
      `- VITE_SUPABASE_URL\n` +
      `- VITE_SUPABASE_ANON_KEY\n\n` +
      `See README.md for setup instructions.`
    );
  }
  return value;
}

function validateSupabaseUrl(url: string): void {
  try {
    const parsedUrl = new URL(url);
    if (!parsedUrl.hostname.includes('supabase')) {
      console.warn('⚠️  Supabase URL does not contain "supabase" - please verify it is correct');
    }
  } catch {
    throw new EnvValidationError(
      `Invalid VITE_SUPABASE_URL: "${url}"\n` +
      `Expected a valid URL (e.g., https://your-project.supabase.co)`
    );
  }
}

function validateSupabaseKey(key: string): void {
  // Supabase anon keys are typically JWT tokens (very long strings)
  if (key.length < 100) {
    console.warn('⚠️  VITE_SUPABASE_ANON_KEY seems unusually short - please verify it is correct');
  }
}

/**
 * Validates and returns environment configuration
 * Throws EnvValidationError if validation fails
 */
export function getEnvConfig(): EnvConfig {
  const supabaseUrl = validateEnvVar('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL);
  const supabaseAnonKey = validateEnvVar('VITE_SUPABASE_ANON_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY);

  // Additional validation
  validateSupabaseUrl(supabaseUrl);
  validateSupabaseKey(supabaseAnonKey);

  return {
    supabase: {
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
    },
  };
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV;
}

/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
  return import.meta.env.PROD;
}

// Validate environment on module load
try {
  getEnvConfig();
  console.log('✅ Environment variables validated successfully');
} catch (error) {
  if (error instanceof EnvValidationError) {
    console.error('❌ Environment Validation Failed:\n', error.message);
    // In production, we want to fail fast
    if (isProduction()) {
      throw error;
    }
  }
}

