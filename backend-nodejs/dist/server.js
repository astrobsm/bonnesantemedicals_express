"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = require("./config/config");
const prisma_1 = require("./lib/prisma");
const port = config_1.config.PORT || 3001;
async function startServer() {
    try {
        await prisma_1.prisma.$connect();
        console.log('✅ Connected to database successfully');
        app_1.app.listen(port, () => {
            console.log(`🚀 Server running on port ${port}`);
            console.log(`📊 Environment: ${config_1.config.NODE_ENV}`);
            console.log(`🌐 API base URL: http://localhost:${port}/api/v1`);
            console.log(`💻 Health check: http://localhost:${port}/health`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');
    await prisma_1.prisma.$disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down server...');
    await prisma_1.prisma.$disconnect();
    process.exit(0);
});
startServer();
//# sourceMappingURL=server.js.map