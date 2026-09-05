import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60, // 1 hour
      // The default "online" mode pauses every query while navigator.onLine is
      // false, which would defeat the Firestore persistent cache. Firestore is
      // the offline store; Query just has to stop refusing to ask for it.
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
})
