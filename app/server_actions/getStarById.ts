"use server";

import { db } from '@/lib/db';
import { starTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

type GetStarProps = {
    starId: string;
};

export type Star = {
    starID: number;
    name: string | null;
    description: string | null;
    xPosition: number | null;
    yPosition: number | null;
    zPosition: number | null;
    modleName: string | null;
    size: number | null;
    imageURL: string[] | null;
    color1: string | null;
    color2: string | null;
    color3: string | null;
    color4: string | null;
    solarFlareGIF: string | null;
};

export default async function getStarById(props: GetStarProps) {
    try {
        console.log("Fetching star with ID:", props.starId);

        const starIdNumber = parseInt(props.starId, 10);

        const results = await db
            .select()
            .from(starTable)
            .where(eq(starTable.starID, starIdNumber))
            .limit(1);

        if (results.length === 0) {
            console.log("No star found with ID:", props.starId);
            return NextResponse.json({
                star: null
            }, { status: 404 });
        }

        const starData = results[0];

        const star: Star = {
            starID: starData.starID,
            name: starData.name,
            description: starData.description,
            xPosition: starData.xPosition,
            yPosition: starData.yPosition,
            zPosition: starData.zPosition,
            modleName: starData.modleName,
            size: starData.size,
            imageURL: starData.imageURL ? starData.imageURL.split(',') : null,
            color1: starData.color1,
            color2: starData.color2,
            color3: starData.color3,
            color4: starData.color4,
            solarFlareGIF: starData.solarFlareGIF
        };

        return NextResponse.json({ star });
    } catch (error) {
        console.error("Error fetching star:", error);
        return NextResponse.json({
            star: null,
            error: "Failed to fetch star"
        }, { status: 500 });
    }
}
