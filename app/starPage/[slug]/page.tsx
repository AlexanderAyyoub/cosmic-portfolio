
import checkStar from "@/app/server_actions/checkStarById";
import getStarById from "@/app/server_actions/getStarById";
import StarPageScene from "components/star-page-scene";
import { notFound } from "next/navigation";

type PageProps = {
    params: { slug: string };
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

    return <StarPageScene star={checkData.star} />; 

}