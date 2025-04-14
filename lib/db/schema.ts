import { int, float, mysqlTable, varchar, text, mediumtext } from 'drizzle-orm/mysql-core';

export const starTable = mysqlTable('star', {
    starID: int('starID').notNull().primaryKey(),
    name: text('Name'),
    description: mediumtext('Description'),
    xPosition: float('xPosition'),
    yPosition: float('yPosition'),
    zPosition: float('zPosition'),
    modleName: text('modleName'),
    size: float('Size'),
    imageURL: text('imageURL'),
    color1: varchar('color1', { length: 7 }),
    color2: varchar('color2', { length: 7 }),
    color3: varchar('color3', { length: 7 }),
    color4: varchar('color4', { length: 7 }),
    solarFlareGIF: varchar('solarFlareGIF', { length: 10000 }),
});

export const constellationTable = mysqlTable('Constellation', {
    constellationID: int('constellationID').notNull().primaryKey(),
    name: varchar('Name', { length: 45 }),
    xPosition: float('xPosition'),
    yPosition: float('yPosition'),
    zPosition: float('zPosition'),
});