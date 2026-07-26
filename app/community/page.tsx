import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CommunityClient } from "@/components/community/community-client";

export const dynamic = "force-dynamic";
export default async function CommunityPage() {
  const user = await getCurrentUser();
  const posts = await db.post.findMany({ include: { author: { select: { name: true, handle: true, membership: true } }, likes: true, bookmarks: true, comments: { include: { author: { select: { name: true, handle: true } } }, orderBy: { createdAt: "asc" } } }, orderBy: { createdAt: "desc" }, take: 30 });
  const members = await db.user.findMany({ select: { id: true, name: true, handle: true, bio: true, interests: true, membership: true }, take: 8 });
  const notifications = user ? await db.notification.findMany({ where: { recipientId: user.id }, orderBy: { createdAt: "desc" }, take: 8 }) : [];
  return <CommunityClient initialPosts={JSON.parse(JSON.stringify(posts))} members={members} user={user} notifications={JSON.parse(JSON.stringify(notifications))} />;
}
