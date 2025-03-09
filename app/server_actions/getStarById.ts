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
    imageURL: string | null;
};

export default async function getStarById(props: GetStarProps) {
    try {
        console.log("Fetching star with ID:", props.starId);

        // Convert string ID to number
        const starIdNumber = parseInt(props.starId, 10);

        // Query the database
        const results = await db
            .select()
            .from(starTable)
            .where(eq(starTable.starID, starIdNumber))
            .limit(1);

        // Check if we found a star
        if (results.length === 0) {
            console.log("No star found with ID:", props.starId);
            return NextResponse.json({
                star: null
            }, { status: 404 });
        }

        // Get the first (and only) result
        const starData = results[0];

        // Transform the data to match the Star type with proper field names
        const star: Star = {
            starID: starData.starID,
            name: starData.name,
            description: starData.description,
            xPosition: starData.xPosition,
            yPosition: starData.yPosition,
            zPosition: starData.zPosition,
            modleName: starData.modleName,
            size: starData.size,
            imageURL: starData.imageURL
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