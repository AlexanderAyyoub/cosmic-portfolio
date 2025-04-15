    "use server";

    import { db } from '@/lib/db';
    import { starTable } from '@/lib/db/schema';
    import { NextResponse } from 'next/server';
    import { Star } from './types/star';

    // export type Star = {
    //     starID: number;
    //     name: string | null;
    //     description: string | null;
    //     xPosition: number | null;
    //     yPosition: number | null;
    //     zPosition: number | null;
    //     modleName: string | null;
    //     size: number | null;
    //     imageURL: string[];
    //     color1: string | null;
    //     color2: string | null;
    //     color3: string | null;
    //     color4: string | null;
    //     solarFlareGIF: string | null;
    // };

    export default async function getAllStars() {
        try {
            const results = await db.select().from(starTable);

            if (!results || results.length === 0) {
                console.log("No Stars", results);
                return NextResponse.json({
                    stars: null
                }, { status: 404 });
            }

            const stars: Star[] = results.map(starData => ({
                starID: starData.starID,
                name: starData.name,
                description: starData.description,
                xPosition: starData.xPosition,
                yPosition: starData.yPosition,
                zPosition: starData.zPosition,
                modleName: starData.modleName,
                size: starData.size,
                imageURL: starData.imageURL ? starData.imageURL.split(",") : [],
                color1: starData.color1,
                color2: starData.color2,
                color3: starData.color3,
                color4: starData.color4,
                solarFlareGIF: starData.solarFlareGIF
            }));

            return NextResponse.json({ stars });

        } catch (error) {
            console.error("Error fetching stars:", error);
            return NextResponse.json({
                stars: [],
                error: "Failed to fetch stars"
            }, { status: 500 });
        }
    }
