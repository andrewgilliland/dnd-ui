import { Navigate, Route, Routes } from "react-router";
import { ROUTES } from "./constants/routes";
import { AuthProvider } from "./context/AuthProvider";
import { AuthLayout } from "./components/AuthLayout";
import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CharacterDetailPage } from "./pages/CharacterDetailPage";
import { CharactersPage } from "./pages/CharactersPage";
import { ConfirmSignUpPage } from "./pages/ConfirmSignUpPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { HomePage } from "./pages/HomePage";
import { ItemDetailPage } from "./pages/ItemDetailPage";
import { ItemsPage } from "./pages/ItemsPage";
import { LoginPage } from "./pages/LoginPage";
import { MonsterDetailPage } from "./pages/MonsterDetailPage";
import { MonstersPage } from "./pages/MonstersPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { SignUpPage } from "./pages/SignUpPage";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public auth routes */}
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route path={ROUTES.signUp} element={<SignUpPage />} />
          <Route path={ROUTES.confirmSignUp} element={<ConfirmSignUpPage />} />
          <Route
            path={ROUTES.forgotPassword}
            element={<ForgotPasswordPage />}
          />
        </Route>

        {/* Protected app routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path={ROUTES.home} element={<HomePage />} />
            <Route path={ROUTES.characters} element={<CharactersPage />} />
            <Route
              path={`${ROUTES.characters}/:id`}
              element={<CharacterDetailPage />}
            />
            <Route path={ROUTES.items} element={<ItemsPage />} />
            <Route path={`${ROUTES.items}/:id`} element={<ItemDetailPage />} />
            <Route path={ROUTES.monsters} element={<MonstersPage />} />
            <Route
              path={`${ROUTES.monsters}/:id`}
              element={<MonsterDetailPage />}
            />
            <Route path={ROUTES.notFound} element={<NotFoundPage />} />
            <Route
              path="*"
              element={<Navigate to={ROUTES.notFound} replace />}
            />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
