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
});

export const constellationTable = mysqlTable('Constellation', {
    constellationID: int('constellationID').notNull().primaryKey(),
    name: varchar('Name', { length: 45 }),
    xPosition: float('xPosition'),
    yPosition: float('yPosition'),
    zPosition: float('zPosition'),
});