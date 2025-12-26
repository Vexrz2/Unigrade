// Security utility functions

import crypto from 'crypto';

/**
 * Get the JWT secret, throwing an error if it's not configured
 */
export function getJWTSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.trim() === '') {
        throw new Error('JWT_SECRET environment variable is not configured. This is a critical security requirement.');
    }
    return secret;
}

/**
 * Generate a cryptographically secure random token
 * @param length - Length of the token in bytes (default: 32)
 * @returns Hex-encoded random token
 */
export function generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a secure password reset token with expiration
 * @returns Object containing token and expiration timestamp
 */
export function generatePasswordResetToken(): { token: string; expiresAt: Date } {
    const token = generateSecureToken(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration
    return { token, expiresAt };
}

/**
 * Validate file upload security
 */
export interface FileValidationResult {
    isValid: boolean;
    error?: string;
}

export const FILE_UPLOAD_LIMITS = {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
    ],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
} as const;

/**
 * Validate uploaded file for security
 */
export function validateFileUpload(file: File): FileValidationResult {
    // Check file size
    if (file.size > FILE_UPLOAD_LIMITS.maxSize) {
        return {
            isValid: false,
            error: `File size exceeds maximum allowed (${FILE_UPLOAD_LIMITS.maxSize / 1024 / 1024}MB)`,
        };
    }

    // Check MIME type
    if (!FILE_UPLOAD_LIMITS.allowedMimeTypes.includes(file.type as typeof FILE_UPLOAD_LIMITS.allowedMimeTypes[number])) {
        return {
            isValid: false,
            error: 'Invalid file type. Allowed types: JPEG, PNG, GIF, WebP',
        };
    }

    // Check file extension (defense in depth)
    const fileName = file.name.toLowerCase();
    const hasValidExtension = FILE_UPLOAD_LIMITS.allowedExtensions.some(ext => fileName.endsWith(ext));
    if (!hasValidExtension) {
        return {
            isValid: false,
            error: 'Invalid file extension',
        };
    }

    return { isValid: true };
}

/**
 * Generate OAuth state parameter for CSRF protection
 */
export function generateOAuthState(): string {
    return generateSecureToken(16);
}

/**
 * Verify OAuth state parameter
 */
export function verifyOAuthState(state: string, expectedState: string): boolean {
    if (!state || !expectedState) {
        return false;
    }
    // Use timing-safe comparison to prevent timing attacks
    try {
        return crypto.timingSafeEqual(
            Buffer.from(state),
            Buffer.from(expectedState)
        );
    } catch {
        return false;
    }
}
