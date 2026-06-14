import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuthContext } from "@/hooks/useAuth";
import Login from "@/pages/Login";

const mockLogin = vi.fn();
const mockLogout = vi.fn();

function renderLogin() {
  return render(
    <AuthContext.Provider value={{ user: null, token: null, login: mockLogin, logout: mockLogout, loading: false }}>
      <Login />
    </AuthContext.Provider>
  );
}

describe("Login page", () => {
  it("renders the login form and demo accounts", () => {
    renderLogin();

    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign in/ })).toBeInTheDocument();
    expect(screen.getByText("Demo accounts")).toBeInTheDocument();
  });

  it("populates credentials when a demo account is clicked", () => {
    renderLogin();

    fireEvent.click(screen.getAllByText("Alice")[0]);
    expect(screen.getByDisplayValue("alice@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("password123")).toBeInTheDocument();
  });
});
