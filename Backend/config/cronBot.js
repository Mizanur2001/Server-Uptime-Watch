const { checkServers } = require("../controllers/serverMonitor.controller");
const { checkWebsites } = require("../controllers/websiteMonitor.controller");
const cron = require("node-cron");
const { getIO } = require("./socket");


// 🔄 Every 10 seconds — monitor servers
cron.schedule("*/10 * * * * *", async () => {
    const serverData = await checkServers(null, null, true);
    getIO()?.emit("servers_update", serverData);
    console.log("🔍 Checking servers...");
});

// 🔄 Every 10 seconds — monitor websites
cron.schedule("*/10 * * * * *", async () => {
    const websiteData = await checkWebsites(null, null, true);
    getIO()?.emit("websites_update", websiteData);
    console.log("🌐 Checking websites...");
});