"use server";

import { db } from '@/lib/db';
import { starTable } from '@/lib/db/schema';
import { Star } from './types/star';

export default async function getAllStars(): Promise<Star[]> {
    try {
        const results = await db.select().from(starTable);

        if (!results || results.length === 0) {
            console.log("No Stars found");
            return [];
        }

        // Convert DB results directly to Star objects
        const stars: Star[] = results.map(starData => ({
            starID: starData.starID,
            name: starData.name,
            description: starData.description,
            xPosition: starData.xPosition,
            yPosition: starData.yPosition,
            zPosition: starData.zPosition,
            modleName: starData.modleName,
            size: starData.size,
            // Ensure imageURL is always an array, never null
            imageURL: starData.imageURL ? starData.imageURL.split(",") : [],
            color1: starData.color1,
            color2: starData.color2,
            color3: starData.color3,
            color4: starData.color4,
            solarFlareGIF: starData.solarFlareGIF
        }));

        return stars;

    } catch (error) {
        console.error("Error fetching stars:", error);
        throw new Error("Failed to fetch stars");
    }
}