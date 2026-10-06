import { QueryClient } from "@tanstack/react-query";

/**
 * Shared React Query client instance used across the App.
 *
 * Notes:
 * - Created once at app startup and provided via <QueryClientProvider>.
 * - Uses default configuration; all behavior (retry logic, cache times,
 *   mutation settings, etc.) is customized at the hook level instead.
 */
export const queryClient = new QueryClient({});
