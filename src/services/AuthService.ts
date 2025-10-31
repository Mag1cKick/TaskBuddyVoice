/**
 * Auth Service
 * 
 * Handles all authentication-related operations.
 */

import type { SupabaseClient, User, Session } from '@supabase/supabase-js';
import type {
  IAuthService,
  SignUpCredentials,
  SignInCredentials,
  ServiceResult,
} from './types';

export class AuthService implements IAuthService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Sign up a new user
   */
  async signUp(credentials: SignUpCredentials): Promise<ServiceResult<User>> {
    try {
      // Validate input
      if (!credentials.email || !credentials.email.includes('@')) {
        return {
          data: null,
          error: new Error('Invalid email address'),
          success: false,
        };
      }

      if (!credentials.password || credentials.password.length < 6) {
        return {
          data: null,
          error: new Error('Password must be at least 6 characters'),
          success: false,
        };
      }

      const { data, error } = await this.supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return {
          data: null,
          error: new Error(error.message),
          success: false,
        };
      }

      if (!data.user) {
        return {
          data: null,
          error: new Error('Failed to create user'),
          success: false,
        };
      }

      return {
        data: data.user,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
        success: false,
      };
    }
  }

  /**
   * Sign in an existing user
   */
  async signIn(credentials: SignInCredentials): Promise<ServiceResult<User>> {
    try {
      // Validate input
      if (!credentials.email || !credentials.email.includes('@')) {
        return {
          data: null,
          error: new Error('Invalid email address'),
          success: false,
        };
      }

      if (!credentials.password) {
        return {
          data: null,
          error: new Error('Password is required'),
          success: false,
        };
      }

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return {
          data: null,
          error: new Error(error.message),
          success: false,
        };
      }

      if (!data.user) {
        return {
          data: null,
          error: new Error('Failed to sign in'),
          success: false,
        };
      }

      return {
        data: data.user,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
        success: false,
      };
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.supabase.auth.signOut();

      if (error) {
        return {
          data: null,
          error: new Error(error.message),
          success: false,
        };
      }

      return {
        data: null,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
        success: false,
      };
    }
  }

  /**
   * Get the current session
   */
  async getSession(): Promise<ServiceResult<Session>> {
    try {
      const { data, error } = await this.supabase.auth.getSession();

      if (error) {
        return {
          data: null,
          error: new Error(error.message),
          success: false,
        };
      }

      if (!data.session) {
        return {
          data: null,
          error: new Error('No active session'),
          success: false,
        };
      }

      return {
        data: data.session,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
        success: false,
      };
    }
  }

  /**
   * Get the current user
   */
  async getUser(): Promise<ServiceResult<User>> {
    try {
      const { data, error } = await this.supabase.auth.getUser();

      if (error) {
        return {
          data: null,
          error: new Error(error.message),
          success: false,
        };
      }

      if (!data.user) {
        return {
          data: null,
          error: new Error('No authenticated user'),
          success: false,
        };
      }

      return {
        data: data.user,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
        success: false,
      };
    }
  }

  /**
   * Subscribe to auth state changes
   * Returns an unsubscribe function
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    const { data: { subscription } } = this.supabase.auth.onAuthStateChange(
      (_event, session) => {
        callback(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }
}

