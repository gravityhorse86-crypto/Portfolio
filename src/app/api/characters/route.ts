import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const count = await prisma.sentence.count({
    where: {
      status_id: "0",
      statusUpdated_at: {
        gte: oneMonthAgo,
      },
    },
  });

  return Response.json({ count });
}
