import LoginPrompt from "@/components/LoginPrompt";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-yellow-300 px-6 py-16">
      <LoginPrompt className="w-full max-w-xl" />
    </main>
  );
}
