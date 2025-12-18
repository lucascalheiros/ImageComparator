import type { Route } from "./+types/home";
import DragArea from "~/views/drag-area";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <DragArea />;
}
