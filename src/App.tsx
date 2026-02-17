import { Navigate, Route, Routes } from "react-router";
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
        <Route path="/" element={<HomePage />} />
        <Route path="/characters" element={<CharactersPage />} />
        <Route path="/characters/:id" element={<CharacterDetailPage />} />
        <Route path="/items" element={<ItemsPage />} />
        <Route path="/items/:id" element={<ItemDetailPage />} />
        <Route path="/monsters" element={<MonstersPage />} />
        <Route path="/monsters/:id" element={<MonsterDetailPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
