// Django PBKDF2 Password Verification Utility
// Supports Django's default pbkdf2_sha256 password hashing

/**
 * Verifies a password against a Django PBKDF2 hash
 * @param password - Plain text password to verify
 * @param encodedHash - Django password hash (format: pbkdf2_sha256$iterations$salt$hash)
 * @returns Promise<boolean> - True if password matches
 */
export async function verifyDjangoPassword(
    password: string,
    encodedHash: string
): Promise<boolean> {
    try {
        const parts = encodedHash.split("$");

        if (parts.length !== 4) {
            console.error("Invalid Django password hash format");
            return false;
        }

        const [algorithm, iterations, salt, hash] = parts;

        // Only support pbkdf2_sha256 for now
        if (algorithm !== "pbkdf2_sha256") {
            console.error(`Unsupported algorithm: ${algorithm}`);
            return false;
        }

        // Derive key using PBKDF2
        const encoder = new TextEncoder();
        const passwordData = encoder.encode(password);
        const saltData = encoder.encode(salt);

        const keyMaterial = await crypto.subtle.importKey(
            "raw",
            passwordData,
            { name: "PBKDF2" },
            false,
            ["deriveBits"]
        );

        const derivedBits = await crypto.subtle.deriveBits(
            {
                name: "PBKDF2",
                salt: saltData,
                iterations: parseInt(iterations),
                hash: "SHA-256",
            },
            keyMaterial,
            256 // 32 bytes = 256 bits
        );

        // Convert to base64 for comparison
        const derivedHash = btoa(
            String.fromCharCode(...new Uint8Array(derivedBits))
        );

        return derivedHash === hash;
    } catch (error) {
        console.error("Error verifying Django password:", error);
        return false;
    }
}

/**
 * Check if a string is a Django password hash
 */
export function isDjangoPasswordHash(value: string): boolean {
    return value.startsWith("pbkdf2_sha256$") ||
        value.startsWith("pbkdf2_sha1$") ||
        value.startsWith("argon2$") ||
        value.startsWith("bcrypt$");
}
