"use server";

import { db } from '@/lib/db';
import { starTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

type CheckStarProps = {
  starId: string;
};

export default async function checkStar(props: CheckStarProps) {
  console.log("Checking star with id: ", props.starId);

  try {
    const starIdNumber = parseInt(props.starId, 10);

    if (isNaN(starIdNumber)) {
      return NextResponse.json(
        {
          status: "invalid",
          exists: false,
        },
        { status: 400 }
      );
    }

    const starResult = await db
      .select()
      .from(starTable)
      .where(eq(starTable.starID, starIdNumber))
      .limit(1);

    if (starResult.length > 0) {
      return NextResponse.json({
        status: "valid",
        exists: true,
      });
    }

    return NextResponse.json(
      {
        status: "invalid",
        exists: false,
      },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error checking star:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to check star",
      },
      { status: 500 }
    );
  }
}