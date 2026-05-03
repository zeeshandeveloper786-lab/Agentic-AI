import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// Fallback key (should be replaced by ENCRYPTION_KEY in .env)
const RAW_KEY = process.env.ENCRYPTION_KEY || 'default-secret-key-1234567890123';
const IV_LENGTH = 16;

/**
 * Ensures we always have a 32-byte key regardless of the input key length.
 * We use SHA-256 to hash the key to exactly 32 bytes.
 */
function getKey() {
    return crypto.createHash('sha256').update(RAW_KEY).digest();
}

export function encrypt(text) {
    if (!text) return text;
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text) {
    if (!text) return text;
    try {
        let textParts = text.split(':');
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error('Decryption failed. Ensure ENCRYPTION_KEY is correct.');
        return null; // Return null if decryption fails
    }
}
