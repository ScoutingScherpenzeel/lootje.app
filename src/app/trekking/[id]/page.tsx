import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import GroupDetailView from "@/components/group-detail/GroupDetailView";
import { getGroupDetail } from "@/actions/groupDetailActions";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function Page({ params }: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const { id } = await params

  console.log("Fetching details for group ID:", id);
  
  const detail = await getGroupDetail(id);

  if (!detail) {
    notFound();
  }

  return <GroupDetailView group={detail.group} participants={detail.participants} />;
}