
import { db } from "../src/lib/db";

const TARGET_COMPANY_ID = "cmkoaevjj0001rm3bdd1bj0r8"; // From previous debug step
const PROJECT_ID = "cmkoajz3h0007rm3bjrxal5wh";

async function main() {
    console.log(`\n🔍  Investigating Access for Project: ${PROJECT_ID}`);
    console.log(`🏢  Target Company ID: ${TARGET_COMPANY_ID}`);

    // 1. Confirm Project Ownership
    const project = await db.project.findUnique({
        where: { id: PROJECT_ID },
        select: { id: true, name: true, companyId: true }
    });

    if (!project) {
        console.error("❌  Project not found in DB (Unexpected!).");
        return;
    }

    if (project.companyId !== TARGET_COMPANY_ID) {
        console.warn(`⚠️  Mismatch! Project actually belongs to: ${project.companyId}`);
    } else {
        console.log("✅  Project belongs to target company confirmed.");
    }

    // 2. List Users in this Company
    console.log(`\n👥  Users in Company (${TARGET_COMPANY_ID}):`);
    const users = await db.user.findMany({
        where: { companyId: TARGET_COMPANY_ID },
        select: { id: true, name: true, email: true, userType: true }
    });

    if (users.length === 0) {
        console.log("⚠️  No users found for this company.");
    } else {
        console.table(users);
    }

    console.log("\n💡  TROUBLESHOOTING:");
    console.log("    To see this project, you must be logged in as one of the users listed above.");
    console.log("    Next.js returns 404 if the query `where: { id, companyId }` fails to match both.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
