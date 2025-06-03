import { PrismaClient } from './generated/prisma'

declare global {
  var prisma: PrismaClient | undefined
}

const prisma = globalThis.prisma ?? new PrismaClient({
  log: ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

export default prisma 