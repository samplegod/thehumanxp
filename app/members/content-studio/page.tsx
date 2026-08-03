import { notFound } from "next/navigation";
import { ContentStudio } from "./studio";
import "./studio.css";

export const dynamic = "force-dynamic";

export default function ContentStudioPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <ContentStudio />;
}
