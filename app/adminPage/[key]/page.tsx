import { notFound } from "next/navigation";
import AdminLayout from "components/admin-page";

const VALID_ADMIN_KEY = process.env.ADMIN_KEY;

type PageProps = {
  params: { key: string };
};

export default async function AdminPage({ params }: PageProps) {

  const resolvedParams = await Promise.resolve(params);
  const key = resolvedParams.key;
  
  //Error handeling 
  if (!VALID_ADMIN_KEY) {
    throw new Error("ADMIN_KEY environment variable does not exist");
  }
  
  //Main checker 
  if (!key || key !== VALID_ADMIN_KEY) {
    notFound();
  }

  return <AdminLayout />;
}