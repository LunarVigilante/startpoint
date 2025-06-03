import { PrismaClient } from './generated/prisma'

declare global {
  var prisma: PrismaClient | undefined
}

// Production-ready Prisma client with proper connection pooling
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

const prisma = globalThis.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

// Graceful shutdown handling
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

// Production-ready query wrapper with retry logic
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: any
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation()
      return result
    } catch (error: any) {
      lastError = error
      console.error(`Database operation attempt ${attempt} failed:`, error.message)
      
      // Don't retry on certain errors
      if (
        error?.code === 'P2002' || // Unique constraint
        error?.code === 'P2025' || // Record not found
        error?.code === 'P2003'    // Foreign key constraint
      ) {
        throw error
      }
      
      if (attempt === maxRetries) {
        break
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
  
  throw lastError
}

export default prisma 