import LoginPrompt from "@/components/LoginPrompt";

export default function LoginPage() {
  const loginMethods = [
    {
      provider: "google",
      label: "Doorgaan met Google",
      accentClass: "bg-yellow-300 hover:bg-yellow-200 text-black",
      icon: "G",
    },
  ];

  return (
    <main className="flex min-h-screen items-center justify-center bg-yellow-300 px-6 py-16">
      <LoginPrompt className="w-full max-w-xl" methods={loginMethods} />
    </main>
  );
}
