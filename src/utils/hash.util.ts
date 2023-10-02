import crypto from 'crypto';

export function hashApiKey(apiKey: string) {
    /*
     * Creating a unique salt for the apiKey
     * Salt is a random bit of data added to the apiKey
     * Salt means that every apiKey's hash is going to be unique
     */
    const salt = crypto.randomBytes(16).toString('hex');

    /*
     * Create a hash with 1000 iterations and reduced hash size to 32 bytes (64 characters in hex)
     */
    const hash = crypto
        .pbkdf2Sync(apiKey, salt, 1000, 32, 'sha512')
        .toString('hex');

    const randomPosition = Math.floor(Math.random() * (hash.length + 1));
    const modifiedHash =
        'ai-' + hash.slice(0, randomPosition) + 'bodarev' + hash.slice(randomPosition);

    return { hash: modifiedHash, salt };
}

export function verifyApiKey({
    candidateApiKey,
    salt,
    hash,
}: {
    candidateApiKey: string;
    salt: string;
    hash: string;
}) {
    const originalHash = hash.replace('bodarev', '').replace('ai-', '');

    /*
     * Create a hash with the salt from the stored apiKey and the candidate apiKey
     */
    const candidateHash = crypto
        .pbkdf2Sync(candidateApiKey, salt, 1000, 32, 'sha512')
        .toString('hex');

    /*
     * If the candidateHash matches the original hash we have stored for the apiKey
     * then the candidate apiKey is correct
     */

    return candidateHash === originalHash;
}
