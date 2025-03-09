"use server";

import { db } from '@/lib/db';
import { starTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

type CheckStarProps = {
    starId: string;
}

export default async function checkStar(props: CheckStarProps) {
    console.log("Checking star with id: ", props.starId);

    try {
        // Convert string to number
        const starIdNumber = parseInt(props.starId, 10);

        // Query to check if the star exists
        const starResult = await db
            .select({ id: starTable.starID })
            .from(starTable)
            .where(eq(starTable.starID, starIdNumber))
            .limit(1);

        // Check if we found a star with the given ID
        if (starResult.length > 0) {
            return NextResponse.json({
                status: "valid",
                exists: true
            });
        }

        return NextResponse.json({
            status: "invalid",
            exists: false
        }, { status: 404 });
    } catch (error) {
        console.error("Error checking star:", error);
        return NextResponse.json({
            status: "error",
            message: "Failed to check star"
        }, { status: 500 });
    }
}