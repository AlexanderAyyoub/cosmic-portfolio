'use server';

import { db } from '@/lib/db';
import { starTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function removeStar(starID: number) {
  try {
    return await db.transaction(async (tx) => {
      // Check if the star exists
      const existingStars = await tx
        .select({ id: starTable.starID })
        .from(starTable)
        .where(eq(starTable.starID, starID));
      
      const starExists = existingStars.length > 0;
      
      if (!starExists) {
        return { success: false, message: `Star with ID ${starID} not found.` };
      }
      
      // Delete the star
      await tx
        .delete(starTable)
        .where(eq(starTable.starID, starID));
      
      return { success: true };
    });
  } catch (error) {
    console.error('Error removing star:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Something went wrong while removing the star.' 
    };
  }
}