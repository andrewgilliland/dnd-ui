import { NotFoundState } from "../components/NotFoundState";
import { ROUTES } from "../constants/routes";

export function NotFoundPage() {
  return (
    <NotFoundState
      title="Page not found"
      description="The route you entered does not exist."
      backTo={ROUTES.home}
      backLabel="Back to home"
    />
  );
}
