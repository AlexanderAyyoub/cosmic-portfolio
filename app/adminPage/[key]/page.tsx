import { notFound } from "next/navigation";

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

    return (
        <div>
            <h1>Admin Page</h1>
        </div>
    );
}
