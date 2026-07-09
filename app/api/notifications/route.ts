import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getNotificationsByUser, getUnreadNotificationCount } from "@/lib/data";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [notifications, unread] = await Promise.all([
    getNotificationsByUser(session.user.id, 20),
    getUnreadNotificationCount(session.user.id),
  ]);

  return NextResponse.json({ notifications, unread });
}
