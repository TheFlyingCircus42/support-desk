export const up = (pgm) => {
    pgm.createExtension("pgcrypto", { ifNotExists: true})
}

export const down = (pgm) => {
    pgm.createExtension("pgcrypto", { ifNotExists: true})
}