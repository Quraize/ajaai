import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { FileText, AlertCircle } from "lucide-react";

const demoUsers = [
  { email: "alice@example.com", password: "password123", name: "Alice" },
  { email: "bob@example.com", password: "password123", name: "Bob" },
  { email: "carol@example.com", password: "password123", name: "Carol" },
];

function getErrorMessage(error: string) {
  if (error.toLowerCase().includes("invalid email or password")) {
    return {
      title: "Invalid credentials",
      message: "The email or password you entered is incorrect. Try one of the demo accounts below.",
    };
  }
  if (error.toLowerCase().includes("network")) {
    return {
      title: "Can’t reach the server",
      message: "Please check your internet connection or try again in a moment.",
    };
  }
  return {
    title: "Something went wrong",
    message: error,
  };
}

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      const backendError = err.response?.data?.error || "Login failed";
      setError(getErrorMessage(backendError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="flex items-center gap-2 mb-8">
        <FileText className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">Ajaia Docs</h1>
      </div>
      <div className="w-full max-w-md space-y-6">
        <form onSubmit={handleSubmit} className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold">Sign in</h2>

          {error && (
            <div className="flex gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <p className="font-medium text-destructive">{error.title}</p>
                <p className="text-destructive/90 mt-1">{error.message}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="bg-muted/50 rounded-xl p-4 text-sm">
          <p className="font-medium mb-2">Demo accounts</p>
          <div className="space-y-1">
            {demoUsers.map((u) => (
              <button
                key={u.email}
                onClick={() => {
                  setEmail(u.email);
                  setPassword(u.password);
                  setError(null);
                }}
                className="w-full text-left px-2 py-1 rounded hover:bg-muted"
              >
                <span className="font-medium">{u.name}</span>{" "}
                <span className="text-muted-foreground">{u.email} / {u.password}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
