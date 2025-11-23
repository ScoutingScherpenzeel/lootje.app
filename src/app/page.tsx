"use server";

import { getGroupsForUser } from "@/actions/groupsAction";
import Hero from "@/components/Hero";
import NewGroup from "@/components/NewGroup";
import GroupsSection from "@/components/GroupsSection";
import LoggedOutCallToAction from "@/components/LoggedOutCallToAction";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Session } from "@/lib/auth-client";
import React from "react";

/**
 * Home page component
 */
export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return <UnauthenticatedHome />;
  return <AuthenticatedHome session={session} />;
}

/**
 * Home page for authenticated users
 * @param session - User session
 */
async function AuthenticatedHome({ session }: { session: Session }) {
  const groups = await getGroupsForUser(session.user.id);

  return (
    <PageLayout session={session}>
      <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <h2>Mijn trekkingen</h2>
        <NewGroup />
      </div>

      <GroupsSection groups={groups} />
    </PageLayout>
  );
}

/**
 * Home page for unauthenticated users
 */
async function UnauthenticatedHome() {
  return (
    <PageLayout>
      <LoggedOutCallToAction />
    </PageLayout>
  );
}

/**
 * Page layout component
 * @param session - User session
 * @param children - Child components
 */
function PageLayout({
  session,
  children,
}: {
  session?: Session;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="">
        <Hero name={session?.user.name} />
        <div className="mx-auto max-w-7xl px-6 py-16">{children}</div>
      </div>
    </>
  );
}
