import { notFound } from "next/navigation";
import AdminLayout from "components/admin-page";

const VALID_ADMIN_KEY = process.env.ADMIN_KEY;

type PageProps = {
  params: Promise<{ key: string }>;
};

export default async function AdminPage({ params }: PageProps) {
  const { key } = await params;

  if (!VALID_ADMIN_KEY) {
    throw new Error("ADMIN_KEY environment variable does not exist");
  }

  if (!key || key !== VALID_ADMIN_KEY) {
    notFound();
  }

  return <AdminLayout />;
}