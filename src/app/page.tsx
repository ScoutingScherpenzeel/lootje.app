"use server";

import { getGroupsForUser } from "@/actions/groupsAction";
import Hero from "@/components/Hero";
import NewGroup from "@/components/NewGroup";
import GroupsSection from "@/components/GroupsSection";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {

  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    redirect("/login")
  }

  // get all groups from drizzle
  const groups = await getGroupsForUser(session.user.id);

  return (
    <div className="">
      <Hero name={session.user.name} />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="relative">
            <div className="absolute -left-4 top-0 w-2 h-full bg-red-600" />
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tight">Mijn trekkingen</h2>
            <div className="mt-2 w-32 h-2 bg-yellow-400" />
          </div>
         <NewGroup />
        </div>

        <GroupsSection groups={groups} />
      </div> 


    </div>
  );
}
