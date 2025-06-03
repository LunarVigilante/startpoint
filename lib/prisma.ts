import { PrismaClient } from './generated/prisma'

declare global {
  var prisma: PrismaClient | undefined
}

// Construct the database URL with proper parameters for serverless
const getDatabaseUrl = () => {
  const baseUrl = process.env.DATABASE_URL
  if (!baseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  
  // Add parameters to disable prepared statements and limit connections
  const url = new URL(baseUrl)
  url.searchParams.set('prepared_statements', 'false')
  url.searchParams.set('connection_limit', '1')
  url.searchParams.set('pool_timeout', '20')
  url.searchParams.set('statement_cache_size', '0')
  
  return url.toString()
}

// Create Prisma client with serverless-friendly configuration
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  })
}

const prisma = globalThis.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

// Helper function to handle database operations with retries
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 2,
  delay = 500
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      console.error(`Database operation attempt ${attempt} failed:`, error.message)
      
      // Check if it's a connection or prepared statement error
      if (
        error?.code === 'P2010' ||
        error?.code === 'P1001' ||
        (error?.meta && error.meta.code === '42P05') ||
        error?.message?.includes('prepared statement') ||
        error?.message?.includes('already exists') ||
        error?.message?.includes('connection')
      ) {
        if (attempt === maxRetries) {
          console.error(`Failed after ${maxRetries} attempts:`, error.message)
          throw new Error(`Database operation failed: ${error.message}`)
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
        continue
      }
      
      // If it's not a retryable error, throw immediately
      throw error
    }
  }
  
  throw new Error('Unexpected error in retry logic')
}

export default prisma 