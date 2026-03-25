import { integer, real, pgTable, varchar, text } from 'drizzle-orm/pg-core';

export const starTable = pgTable('star', {
  starID: integer('starID').notNull().primaryKey(),
  name: text('Name'),
  description: text('Description'),
  xPosition: real('xPosition'),
  yPosition: real('yPosition'),
  zPosition: real('zPosition'),
  modleName: text('modleName'),
  size: real('Size'),
  imageURL: text('imageURL'),
  color1: varchar('color1', { length: 7 }),
  color2: varchar('color2', { length: 7 }),
  color3: varchar('color3', { length: 7 }),
  color4: varchar('color4', { length: 7 }),
  solarFlareGIF: text('solarFlareGIF'),
});

export const constellationTable = pgTable('Constellation', {
  constellationID: integer('constellationID').notNull().primaryKey(),
  name: varchar('Name', { length: 45 }),
  xPosition: real('xPosition'),
  yPosition: real('yPosition'),
  zPosition: real('zPosition'),
});