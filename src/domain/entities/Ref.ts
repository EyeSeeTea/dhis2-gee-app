export type Id = string;

export interface Ref {
    id: Id;
}

const abc = "abcdefghijklmnopqrstuvwxyz";
const letters = abc.concat(abc.toUpperCase());

const ALLOWED_CHARS = `0123456789${letters}`;

const NUMBER_OF_CODEPOINTS = ALLOWED_CHARS.length;
const CODESIZE = 11;

const CODE_PATTERN = /^[a-zA-Z]{1}[a-zA-Z0-9]{10}$/;

function randomWithMax(max: number) {
    return Math.floor(Math.random() * max);
}

/**
 * Generate a valid DHIS2 uid. A valid DHIS2 uid is a 11 character string which starts with a letter from the ISO basic Latin alphabet.
 *
 * @return {string} A 11 character uid that always starts with a letter.
 *
 * generateUid();
 */
export function generateId() {
    // First char should be a letter
    let randomChars = letters.charAt(randomWithMax(letters.length));

    for (let i = 1; i < CODESIZE; i += 1) {
        randomChars += ALLOWED_CHARS.charAt(randomWithMax(NUMBER_OF_CODEPOINTS));
    }

    // return new String( randomChars );
    return randomChars;
}

/**
 * Tests whether the given code is valid.
 *
 * @param {string} code The code to validate.
 * @return {boolean} Returns true if the code is valid, false otherwise.
 *
 * isValidUid('JkWynlWMjJR'); // true
 * isValidUid('0kWynlWMjJR'); // false (Uid can not start with a number)
 * isValidUid('AkWy$lWMjJR'); // false (Uid can only contain alphanumeric characters.
 */
export function isValidId(code: string) {
    if (code == null) {
        // eslint-disable-line eqeqeq
        return false;
    }

    return CODE_PATTERN.test(code);
}
