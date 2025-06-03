import { PrismaClient } from './generated/prisma'

declare global {
  var prisma: PrismaClient | undefined
}

const prisma = globalThis.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Add connection pooling settings for better serverless handling
  datasourceUrl: process.env.DATABASE_URL,
})

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

// Helper function to handle prepared statement conflicts
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 100
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      // Check if it's the prepared statement error
      if (
        error?.code === 'P2010' ||
        (error?.meta && error.meta.code === '42P05') ||
        error?.message?.includes('prepared statement') ||
        error?.message?.includes('already exists')
      ) {
        if (attempt === maxRetries) {
          console.error(`Failed after ${maxRetries} attempts:`, error.message)
          throw new Error('Database operation failed after multiple retries')
        }
        
        // Wait before retrying with exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
        continue
      }
      
      // If it's not a prepared statement error, throw immediately
      throw error
    }
  }
  
  throw new Error('Unexpected error in retry logic')
}

export default prisma 