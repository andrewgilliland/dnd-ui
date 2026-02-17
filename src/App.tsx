import { Navigate, Route, Routes } from "react-router";
import { ROUTES } from "./constants/routes";
import { Layout } from "./components/Layout";
import { CharacterDetailPage } from "./pages/CharacterDetailPage";
import { CharactersPage } from "./pages/CharactersPage";
import { HomePage } from "./pages/HomePage";
import { ItemDetailPage } from "./pages/ItemDetailPage";
import { ItemsPage } from "./pages/ItemsPage";
import { MonsterDetailPage } from "./pages/MonsterDetailPage";
import { MonstersPage } from "./pages/MonstersPage";
import { NotFoundPage } from "./pages/NotFoundPage";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
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
        <Route path="*" element={<Navigate to={ROUTES.notFound} replace />} />
      </Route>
    </Routes>
  );
}

export default App;
