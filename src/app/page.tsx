"use server";

import { getGroupsForUser } from "@/actions/groupsAction";
import Hero from "@/components/Hero";
import NewGroup from "@/components/NewGroup";
import GroupsSection from "@/components/GroupsSection";
import LoggedOutCallToAction from "@/components/LoggedOutCallToAction";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // get all groups from drizzle
  const groups = session ? await getGroupsForUser(session.user.id) : [];

  return (
    <div className="">
      <Hero name={session?.user.name} />

      <div className="mx-auto max-w-7xl px-6 py-16">
        {session ? (
          <>
            <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="relative">
                <div className="absolute top-0 -left-4 h-full w-2 bg-red-600" />
                <h2>Mijn trekkingen</h2>
                <div className="mt-2 h-2 w-32 bg-yellow-400" />
              </div>
              <NewGroup />
            </div>

            <GroupsSection groups={groups} />
          </>
        ) : (
          <LoggedOutCallToAction />
        )}
      </div>
    </div>
  );
}
