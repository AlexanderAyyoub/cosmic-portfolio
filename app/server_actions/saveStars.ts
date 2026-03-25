'use server';

import { db } from '@/lib/db';
import { starTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

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
  color1: string | null;
  color2: string | null;
  color3: string | null;
  color4: string | null;
  solarFlareGIF: string | null;
};

export async function saveStars(formStars: Star[]) {
  try {
    const result = await db.transaction(async (tx) => {
      for (const star of formStars) {
        const starID = star.starID;

        const existingStars = await tx
          .select()
          .from(starTable)
          .where(eq(starTable.starID, starID));

        const starExists = existingStars.length > 0;

        const preparedStar = {
          starID,
          name: star.name,
          description: star.description,
          xPosition: star.xPosition,
          yPosition: star.yPosition,
          zPosition: star.zPosition,
          modleName: star.modleName,
          size: star.size,
          imageURL: star.imageURL.join(','),
          color1: star.color1,
          color2: star.color2,
          color3: star.color3,
          color4: star.color4,
          solarFlareGIF: star.solarFlareGIF,
        };

        if (starExists) {
          await tx
            .update(starTable)
            .set(preparedStar)
            .where(eq(starTable.starID, starID));
        } else {
          await tx
            .insert(starTable)
            .values(preparedStar);
        }
      }

      return { success: true };
    });

    revalidatePath('/');
    revalidatePath('/resume');

    for (const star of formStars) {
      revalidatePath(`/starPage/${star.starID}`);
    }

    return result;
  } catch (error) {
    console.error('Error saving stars:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Something went wrong.',
    };
  }
}