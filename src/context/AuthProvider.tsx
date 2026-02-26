import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  confirmResetPassword,
  confirmSignUp,
  fetchAuthSession,
  getCurrentUser,
  resetPassword,
  signIn,
  signOut,
  signUp,
  type AuthUser,
} from "aws-amplify/auth";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSignIn = useCallback(async (email: string, password: string) => {
    await signIn({ username: email, password });
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleSignUp = useCallback(async (email: string, password: string) => {
    await signUp({
      username: email,
      password,
      options: { userAttributes: { email } },
    });
  }, []);

  const handleConfirmSignUp = useCallback(
    async (email: string, code: string) => {
      await confirmSignUp({ username: email, confirmationCode: code });
    },
    [],
  );

  const handleSignOut = useCallback(async () => {
    await signOut();
    setUser(null);
  }, []);

  const handleResetPassword = useCallback(async (email: string) => {
    await resetPassword({ username: email });
  }, []);

  const handleConfirmResetPassword = useCallback(
    async (email: string, code: string, newPassword: string) => {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      });
    },
    [],
  );

  const getIdToken = useCallback(async (): Promise<string | null> => {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString() ?? null;
    } catch {
      return null;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        confirmSignUp: handleConfirmSignUp,
        signOut: handleSignOut,
        resetPassword: handleResetPassword,
        confirmResetPassword: handleConfirmResetPassword,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
