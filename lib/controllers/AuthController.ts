import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@/lib/models/UserModel';
import Mailjet from 'node-mailjet';
import { validatePassword, validateUsername, validateEmail, validatePasswordMatch, VALIDATION_RULES } from '@/lib/validation';
import { getJWTSecret, generatePasswordResetToken } from '@/lib/security';

export async function handleGoogleAuth(data: {
    googleId: string;
    email: string;
    name: string;
    profilePicture?: string;
}) {
    const { googleId, email, name, profilePicture } = data;

    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId });

    if (!user) {
        // Check if user exists with this email (might be a local account)
        const existingEmailUser = await User.findOne({ email });
        
        if (existingEmailUser) {
            // User exists with email but different auth provider
            if (existingEmailUser.authProvider === 'local') {
                throw new Error('An account with this email already exists. Please sign in with email and password.');
            }
        }

        // Create new user with Google OAuth
        const username = name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000);
        const currentYear = new Date().getFullYear();
        
        user = new User({
            username,
            email,
            googleId,
            authProvider: 'google',
            profilePicture,
            emailVerified: true,
            degree: { type: '', major: '', creditRequirement: 120 },
            courses: [],
            onboardingCompleted: false,
            startYear: currentYear,
            expectedGraduationYear: currentYear + 4,
        });

        await user.save();
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, getJWTSecret(), { expiresIn: '1h' });

    return { token, user };
}

export async function registerUser(data: {
    username: string;
    password: string;
    confirmPassword: string;
    email: string;
    major: string;
}) {
    const { username, password, confirmPassword, email, major } = data;

    // Validate username
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
        throw new Error(usernameValidation.error);
    }

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
        throw new Error(emailValidation.error);
    }

    // Validate password length
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.error);
    }

    // Validate password match
    const matchValidation = validatePasswordMatch(password, confirmPassword);
    if (!matchValidation.isValid) {
        throw new Error(matchValidation.error);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        throw new Error(VALIDATION_RULES.username.messages.taken);
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
        throw new Error(VALIDATION_RULES.email.messages.taken);
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const currentYear = new Date().getFullYear();

    // Create and save the new user
    const newUser = new User({
        username,
        email,
        password: hashedPassword,
        authProvider: 'local',
        emailVerified: false,
        degree: { type: '', major: major, creditRequirement: 120 },
        courses: [],
        onboardingCompleted: false,
        startYear: currentYear,
        expectedGraduationYear: currentYear + 4,
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id }, getJWTSecret(), { expiresIn: '1h' });

    return { token, user: newUser };
}

export async function loginUser(data: { email: string; password: string }) {
    const { email, password } = data;
    const user = await User.findOne({ email });
    
    // Generic error message to prevent user enumeration
    const invalidCredentialsError = 'Invalid email or password';
    
    if (!user) {
        throw new Error(invalidCredentialsError);
    }

    // Check if user is using OAuth
    if (user.authProvider === 'google') {
        throw new Error('This account uses Google Sign-In. Please use the "Sign in with Google" button.');
    }

    // Verify password for local users
    if (!user.password) {
        throw new Error(invalidCredentialsError);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error(invalidCredentialsError);
    }

    const token = jwt.sign({ userId: user._id }, getJWTSecret(), { expiresIn: '1h' });
    return { token, user };
}

export async function recoverUserPassword(email: string) {
    const user = await User.findOne({ email });
    
    // Always return success to prevent email enumeration
    // but only send email if user exists and is not using OAuth
    if (!user || user.authProvider === 'google') {
        // Return success even if user doesn't exist (prevents enumeration)
        return { message: 'If an account exists with this email, a recovery email has been sent.' };
    }

    const mailjet = new Mailjet({
        apiKey: process.env.MJ_APIKEY_PUBLIC || '',
        apiSecret: process.env.MJ_APIKEY_PRIVATE || '',
    });

    // Generate cryptographically secure password reset token
    const { token: resetToken, expiresAt } = generatePasswordResetToken();
    
    // Store the reset token and expiration in the user document
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = expiresAt;
    await user.save();
    
    // Build reset URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/recover-password?token=${resetToken}`;

    try {
        await mailjet.post('send', { version: 'v3.1' }).request({
            Messages: [
                {
                    From: {
                        Email: 'unigradenoreply@gmail.com',
                        Name: 'Unigrade',
                    },
                    To: [
                        {
                            Email: email,
                        },
                    ],
                    Subject: 'Password Reset Request',
                    TextPart: `You requested to reset your password. Click the link below to reset it (expires in 1 hour):\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
                    HTMLPart: `<h3>Password Reset Request</h3><p>You requested to reset your password. Click the link below to reset it (expires in 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, please ignore this email.</p>`,
                },
            ],
        });
    } catch (err) {
        console.error('Failed to send recovery email:', err);
    }

    return { message: 'If an account exists with this email, a recovery email has been sent.' };
}

export async function updateUserPassword(userId: string, data: { currentPassword: string; newPassword: string }) {
    const { currentPassword, newPassword } = data;
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    // Check if user is using OAuth
    if (user.authProvider === 'google') {
        throw new Error('Password change is not available for Google accounts.');
    }

    // Verify password for local users
    if (!user.password) {
        throw new Error('Invalid authentication method');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        throw new Error('Invalid password');
    }

    // Validate new password length
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.error);
    }

    const saltRounds = 10;
    const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = newHashedPassword;
    await user.save();
    return { message: 'Password changed.' };
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
    // Find user with valid reset token
    const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
        throw new Error('Invalid or expired password reset token');
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.error);
    }

    // Hash and save new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return { message: 'Password has been reset successfully.' };
}
