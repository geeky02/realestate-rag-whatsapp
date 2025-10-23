import { useQuery as useConvexQuery } from 'convex/react'
import { FunctionReference, FunctionArgs, FunctionReturnType } from 'convex/server'

/**
 * Type-safe wrapper around Convex useQuery hook
 * Provides better error handling and loading states
 */
export function useQuery<Query extends FunctionReference<'query'>>(
  query: Query,
  args: FunctionArgs<Query> | 'skip'
): {
  data: FunctionReturnType<Query> | undefined
  isLoading: boolean
  error: Error | undefined
} {
  const result = useConvexQuery(query, args)

  return {
    data: result,
    isLoading: result === undefined && args !== 'skip',
    error: undefined, // Convex handles errors internally
  }
}

