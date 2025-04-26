const ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Encode a positive integer as an 8-character base-62 string, left-padded with zeros. */
// function encodeBase62Fixed(num) {
//   if (typeof num !== "number" || num < 0 || !Number.isInteger(num)) {
//     throw new Error("Input must be a non-negative integer.");
//   }
//   if (num === 0) return "0".padStart(8, "0");

//   let s = "";
//   let currentNum = num;
//   while (currentNum > 0) {
//     s = ALPHABET[currentNum % 62] + s;
//     currentNum = Math.floor(currentNum / 62);
//   }
//   return s.padStart(8, "0"); // guarantees 8-char slug
// }

function encodeBase62Fixed(num) {
  if (typeof num !== "number" || num < 0 || !Number.isInteger(num)) {
    throw new Error("Input must be a non-negative integer.");
  }
  if (num === 0) {
    return generateRandomString(7) + "0"; // special case for zero
  }

  let s = "";
  let currentNum = num;
  while (currentNum > 0) {
    s = ALPHABET[currentNum % 62] + s;
    currentNum = Math.floor(currentNum / 62);
  }

  if (s.length < 8) {
    const paddingLength = 8 - s.length;
    const randomPadding = generateRandomString(paddingLength);
    s = randomPadding + s;
  }

  return s;
}

/** Helper to generate random base-62 string of given length */
function generateRandomString(length) {
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * ALPHABET.length);
    result += ALPHABET[randomIndex];
  }
  return result;
}

/** Reverse operation (optional). */
function decodeBase62(slug) {
  if (typeof slug !== "string" || slug.length === 0) {
    throw new Error("Input must be a non-empty string.");
  }
  let n = 0;
  for (const c of slug) {
    const index = ALPHABET.indexOf(c);
    if (index === -1) {
      throw new Error(`Invalid character found in slug: ${c}`);
    }
    n = n * 62 + index;
  }
  return n;
}

module.exports = {
  encodeBase62Fixed,
  decodeBase62,
};