import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";

const Editor = lazy(() => import("@/pages/Editor"));

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading editor…</div>
        </div>
      }
    >
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/documents" /> : <Login />} />
        <Route path="/documents" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/documents/:id" element={user ? <Editor /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={user ? "/documents" : "/login"} />} />
      </Routes>
    </Suspense>
  );
}

export default App;
