/**
 * useServices Hook
 * 
 * React hook to access services throughout the application.
 * This provides a clean way to use dependency injection in React components.
 */

import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createServiceContainer } from '@/services/ServiceContainer';
import type { IServiceContainer } from '@/services/types';

/**
 * Hook to get all services
 * Services are memoized to prevent recreation on every render
 */
export function useServices(): IServiceContainer {
  const services = useMemo(() => {
    return createServiceContainer(supabase);
  }, []);

  return services;
}

/**
 * Hook to get the task service
 */
export function useTaskService() {
  const services = useServices();
  return services.taskService;
}

/**
 * Hook to get the auth service
 */
export function useAuthService() {
  const services = useServices();
  return services.authService;
}

/**
 * Hook to get the analytics service
 */
export function useAnalyticsService() {
  const services = useServices();
  return services.analyticsService;
}

/**
 * Hook to get the realtime service
 */
export function useRealtimeService() {
  const services = useServices();
  return services.realtimeService;
}

