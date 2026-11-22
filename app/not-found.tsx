import { NotFoundView } from "@/components/NotFoundView";

// Exported as 404.html. GitHub Pages serves it for any unknown path, which lets
// critics added since the last build load in the browser at /critics/<slug>/.
export default function NotFound() {
  return <NotFoundView />;
}
