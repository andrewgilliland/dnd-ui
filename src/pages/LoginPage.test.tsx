import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { LoginPage } from "./LoginPage";
import { ROUTES } from "../constants/routes";

interface MockAuthState {
  signIn: ReturnType<typeof vi.fn>;
  user: unknown;
  isLoading: boolean;
}

const mockAuthState: MockAuthState = {
  signIn: vi.fn(),
  user: null,
  isLoading: false,
};

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => mockAuthState,
}));

function renderLogin(
  initialEntries: Array<string | { pathname: string; state?: unknown }> = [
    ROUTES.login,
  ],
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.home} element={<div>Home Screen</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mockAuthState.signIn = vi.fn();
  mockAuthState.user = null;
  mockAuthState.isLoading = false;
});

describe("LoginPage", () => {
  it("renders login fields and links", () => {
    renderLogin();

    expect(screen.getByRole("heading", { name: /sign in/i })).toBeDefined();
    expect(screen.getByLabelText(/email/i)).toBeDefined();
    expect(screen.getByLabelText(/password/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeDefined();
    expect(
      screen.getByRole("link", { name: /forgot password\?/i }),
    ).toBeDefined();
    expect(screen.getByRole("link", { name: /sign up/i })).toBeDefined();
  });

  it("submits credentials and navigates to home on success", async () => {
    mockAuthState.signIn.mockResolvedValueOnce(undefined);
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "hunter2" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockAuthState.signIn).toHaveBeenCalledWith(
        "test@example.com",
        "hunter2",
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Home Screen")).toBeDefined();
    });
  });

  it("shows an error message when sign in fails", async () => {
    mockAuthState.signIn.mockRejectedValueOnce(
      new Error("Invalid credentials"),
    );
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrong-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeDefined();
    });
  });

  it("redirects to home when a user is already authenticated", async () => {
    mockAuthState.user = { username: "demo-user" };
    renderLogin();

    await waitFor(() => {
      expect(screen.getByText("Home Screen")).toBeDefined();
    });

    expect(screen.queryByRole("heading", { name: /sign in/i })).toBeNull();
  });
});
