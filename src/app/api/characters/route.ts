import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionUserIdFromRequest } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const userId = getSessionUserIdFromRequest(request);

  if (!userId) {
    return Response.json(
      { message: "ログインしてください。" },
      { status: 401 },
    );
  }

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const [monthlyCount, totalCount] = await Promise.all([
    prisma.sentence.count({
      where: {
        status_id: "0",
        statusUpdated_at: {
          gte: oneMonthAgo,
        },
      },
    }),
    prisma.sentence.count({
      where: {
        status_id: "0",
      },
    }),
  ]);

  return Response.json({
    count: monthlyCount,
    monthlyCount,
    totalCount,
  });
}
