
import checkStar from "@/app/server_actions/checkStarById";
import getStarById from "@/app/server_actions/getStarById";
import { notFound } from "next/navigation";

type PageProps = {
    params: Promise<{ slug: string }>;
}

export default async function DynamicStarPage(props: PageProps) {
    const { slug } = (await props.params);

    if (!slug || isNaN(Number(slug)) || Number(slug) < 1) {
        return notFound();
    }

    const checkResponse = await checkStar({ starId: slug });
    const checkData = await checkResponse.json();

    if (checkData.status === "invalid" || !checkData.exists) {
        return notFound();
    }

    // Fetch the star data
    const starResponse = await getStarById({ starId: slug });
    const { star } = await starResponse.json();

    if (!star) {
        return notFound();
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">{star.name}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    {star.imageURL && (
                        <div className="mb-4">
                            <img
                                src={star.imageURL}
                                alt={star.name || "Star image"}
                                className="w-full rounded-lg shadow-lg"
                            />
                        </div>
                    )}

                    <div className="p-4 rounded-lg">
                        <h2 className="text-xl font-semibold mb-2">Star Details</h2>
                        <p className="mb-2"><strong>ID:</strong> {star.starID}</p>
                        <p className="mb-2"><strong>Size:</strong> {star.size}</p>
                        <p className="mb-2"><strong>Model:</strong> {star.modleName}</p>

                        <h3 className="text-lg font-semibold mt-4 mb-2">Coordinates</h3>
                        <p className="mb-1"><strong>X:</strong> {star.xPosition}</p>
                        <p className="mb-1"><strong>Y:</strong> {star.yPosition}</p>
                        <p className="mb-1"><strong>Z:</strong> {star.zPosition}</p>
                    </div>
                </div>

                <div>
                    <div className="p-4 rounded-lg">
                        <h2 className="text-xl font-semibold mb-2">Description</h2>
                        <p>{star.description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}