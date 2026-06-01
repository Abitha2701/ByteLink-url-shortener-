const CODE_LENGTH = 7;
const CODE_CHARACTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const MAX_CODE_GENERATION_ATTEMPTS = 5;

function generateShortCode(length = CODE_LENGTH) {
  let code = '';
  for (let i = 0; i < length; i += 1) {
    code += CODE_CHARACTERS.charAt(Math.floor(Math.random() * CODE_CHARACTERS.length));
  }
  return code;
}

async function generateUniqueShortCode(checkExists, maxAttempts = MAX_CODE_GENERATION_ATTEMPTS) {
  if (typeof checkExists !== 'function') {
    throw new Error('checkExists must be a function');
  }

  let shortCode;
  let attempt = 0;

  while (attempt < maxAttempts) {
    shortCode = generateShortCode();
    const exists = await checkExists(shortCode);
    if (!exists) {
      return shortCode;
    }
    attempt += 1;
  }

  throw new Error('Unable to generate a unique short code after several attempts');
}

module.exports = { generateShortCode, generateUniqueShortCode, MAX_CODE_GENERATION_ATTEMPTS };
