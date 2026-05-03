import prisma from '../prisma/client.js';

class CleanupService {
    constructor() {
        this.AGENT_RETENTION_DAYS = 3;
        this.USER_RETENTION_DAYS = 90;
    }

    async start() {
        console.log('🧹 Cleanup Service Started (Running every 24 hours)');
        // Run once on startup
        this.performCleanup();
        // Then run every 24 hours
        setInterval(() => this.performCleanup(), 24 * 60 * 60 * 1000);
    }

    async performCleanup() {
        try {
            console.log('🔍 Running Database Cleanup...');

            const now = new Date();
            const agentDeadline = new Date(now.getTime() - this.AGENT_RETENTION_DAYS * 24 * 60 * 60 * 1000);
            const userDeadline = new Date(now.getTime() - this.USER_RETENTION_DAYS * 24 * 60 * 60 * 1000);

            // 1. Permanently delete Agents older than 3 days
            const deletedAgents = await prisma.agent.deleteMany({
                where: {
                    deletedAt: {
                        not: null,
                        lt: agentDeadline
                    }
                }
            });

            if (deletedAgents.count > 0) {
                console.log(`✅ Permanently deleted ${deletedAgents.count} agents (3-day trash limit)`);
            }

            // 2. Permanently delete Users older than 90 days
            const deletedUsers = await prisma.user.deleteMany({
                where: {
                    deletedAt: {
                        not: null,
                        lt: userDeadline
                    }
                }
            });

            if (deletedUsers.count > 0) {
                console.log(`✅ Permanently deleted ${deletedUsers.count} users (90-day retention limit)`);
            }

        } catch (error) {
            console.error('❌ Cleanup Error:', error.message);
        }
    }
}

export default new CleanupService();
