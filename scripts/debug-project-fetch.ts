
import { db } from "../src/lib/db";

const PROJECT_ID = "cmkoajz3h0007rm3bjrxal5wh";

async function main() {
    console.log(`Checking project: ${PROJECT_ID}`);

    // 1. Basic check - does it exist?
    const basicProject = await db.project.findUnique({
        where: { id: PROJECT_ID },
    });

    if (!basicProject) {
        console.error("❌ Project NOT FOUND in database.");
        return;
    }

    console.log("✅ Project found basic details:", {
        id: basicProject.id,
        name: basicProject.name,
        companyId: basicProject.companyId,
        status: basicProject.status,
    });

    // 2. Complex query check - does the detailed fetch work?
    console.log("\nAttempting complex fetch (mimicking getProjectById)...");

    try {
        const detailedProject = await db.project.findUnique({
            where: {
                id: PROJECT_ID,
                // We act as if we are the correct company
                companyId: basicProject.companyId,
            },
            include: {
                client: true,
                tasks: {
                    include: {
                        assignees: { include: { employee: true } },
                        assignee: true,
                    }
                },
                documents: true,
                dailyLogs: {
                    include: { employee: true, task: true },
                    orderBy: { date: 'desc' },
                    take: 5
                },
                modules: {
                    include: {
                        subModules: true,
                        tasks: true
                    },
                    orderBy: { order: 'asc' }
                },
                comments: {
                    include: { user: true, client: true },
                    orderBy: { createdAt: 'desc' }
                },
                projectEmployees: {
                    include: { employee: true }
                },
                tag: {
                    include: {
                        expenditures: { include: { expenditure: true } },
                        incomes: { include: { income: true } },
                    }
                },
            },
        });

        if (detailedProject) {
            console.log("✅ Detailed fetch SUCCESS.");
            console.log("Tag:", detailedProject.tag ? "Found" : "Null");
            if (detailedProject.tag) {
                console.log("Expenditures count:", detailedProject.tag.expenditures.length);
                console.log("Incomes count:", detailedProject.tag.incomes.length);
            }
        } else {
            console.error("❌ Detailed fetch returned NULL (unexpected given basic fetch worked).");
        }

    } catch (error) {
        console.error("❌ Detailed fetch CRASHED:");
        console.error(error);
    }
}

main()
    .catch((e) => {
        console.error("Script error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
