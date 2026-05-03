import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
import { DATABASE_POOL } from '../config/constants.js';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: DATABASE_POOL.MAX_CONNECTIONS,
    idleTimeoutMillis: DATABASE_POOL.IDLE_TIMEOUT,
    connectionTimeoutMillis: DATABASE_POOL.CONNECTION_TIMEOUT,
});

pool.on('error', (err) => {
    console.error('❌ Unexpected database pool error:', err);
});

pool.on('connect', () => {
    console.log('✅ Database pool connected');
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
});

export default prisma;

