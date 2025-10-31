import { vi } from 'vitest';

/**
 * Mock Supabase Client
 * Provides a comprehensive mock for testing Supabase interactions
 */

export const createMockSupabaseClient = () => {
  const mockData: any[] = [];
  
  const mockSelect = vi.fn().mockReturnThis();
  const mockInsert = vi.fn().mockReturnThis();
  const mockUpdate = vi.fn().mockReturnThis();
  const mockDelete = vi.fn().mockReturnThis();
  const mockEq = vi.fn().mockReturnThis();
  const mockOrder = vi.fn().mockReturnThis();
  const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });
  const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });

  const mockFrom = vi.fn((table: string) => ({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    eq: mockEq,
    order: mockOrder,
    single: mockSingle,
    maybeSingle: mockMaybeSingle,
  }));

  const mockChannel = vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn((callback) => {
      if (callback) callback('SUBSCRIBED');
      return { unsubscribe: vi.fn() };
    }),
  }));

  const mockRemoveChannel = vi.fn();

  const mockAuth = {
    getSession: vi.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    }),
    getUser: vi.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    }),
    signUp: vi.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    }),
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn((callback) => {
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      };
    }),
  };

  return {
    from: mockFrom,
    channel: mockChannel,
    removeChannel: mockRemoveChannel,
    auth: mockAuth,
    // Helper to set mock data
    __setMockData: (data: any[]) => {
      mockData.length = 0;
      mockData.push(...data);
      mockSelect.mockResolvedValue({ data, error: null });
    },
    // Helper to set mock error
    __setMockError: (error: any) => {
      mockSelect.mockResolvedValue({ data: null, error });
      mockInsert.mockResolvedValue({ data: null, error });
      mockUpdate.mockResolvedValue({ data: null, error });
      mockDelete.mockResolvedValue({ data: null, error });
    },
    // Expose mocks for assertions
    __mocks: {
      from: mockFrom,
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq,
      order: mockOrder,
      channel: mockChannel,
      removeChannel: mockRemoveChannel,
    },
  };
};

// Mock Supabase module
export const mockSupabase = createMockSupabaseClient();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

