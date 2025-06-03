import { PrismaClient } from './generated/prisma'

declare global {
  var prisma: PrismaClient | undefined
}

// Simple, clean Prisma client for Neon serverless PostgreSQL
const prisma = globalThis.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

export default prisma 