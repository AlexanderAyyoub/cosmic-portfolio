'use server';

import { db } from '@/lib/db';
import { starTable } from '@/lib/db/schema';

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
    const insertPayload = formStars.map((star) => ({
      starID: star.starID,
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
    }));

    await db.insert(starTable).values(insertPayload as typeof starTable.$inferInsert[]);
    return { success: true };
  } catch (error) {
    console.error('Error inserting stars:', error);
    return { success: false, message: 'Something went wrong.' };
  }
}
