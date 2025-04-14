import { notFound } from "next/navigation";
import AdminLayout from "components/admin-page"

type PageProps = {
    params: { key?: string }; 
};

export default function AdminPage({ params }: PageProps) {

    if (!params?.key) {
        notFound(); 
    }

    const correctKey = process.env.ADMIN_KEY;

    if (params.key !== correctKey) {
        notFound();
    }

    return <AdminLayout />

}
