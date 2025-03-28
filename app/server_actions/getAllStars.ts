"use server";

import { db } from '@/lib/db';
import { starTable } from '@/lib/db/schema';
import { NextResponse } from 'next/server';

export type Star = {
    starID: number;
    name: string | null;
    description: string | null;
    xPosition: number | null;
    yPosition: number | null;
    zPosition: number | null;
    modleName: string | null;
    size: number | null;
    imageURL: string[]; 
};

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
            imageURL: starData.imageURL ? starData.imageURL.split(",") : [] // Convert to array
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
