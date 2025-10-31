/**
 * Services Index
 * 
 * Central export point for all services.
 */

// Types
export type * from './types';

// Services
export { TaskService } from './TaskService';
export { AuthService } from './AuthService';
export { AnalyticsService } from './AnalyticsService';
export { RealtimeService } from './RealtimeService';

// Container
export { ServiceContainer, createServiceContainer } from './ServiceContainer';

// Hooks
export {
  useServices,
  useTaskService,
  useAuthService,
  useAnalyticsService,
  useRealtimeService,
} from '../hooks/useServices';

