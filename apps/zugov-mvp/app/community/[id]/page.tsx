import { CommunityRoom } from "@/components/CommunityRoom";

export const dynamic = "force-dynamic";

export default async function CommunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CommunityRoom communityId={id} />;
}
