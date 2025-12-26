import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@/lib/models/UserModel';
import Mailjet from 'node-mailjet';
import { validatePassword, validateUsername, validateEmail, validatePasswordMatch, VALIDATION_RULES } from '@/lib/validation';

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
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || '', { expiresIn: '1h' });

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
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET || '', { expiresIn: '1h' });

    return { token, user: newUser };
}

export async function loginUser(data: { email: string; password: string }) {
    const { email, password } = data;
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Invalid email');
    }

    // Check if user is using OAuth
    if (user.authProvider === 'google') {
        throw new Error('This account uses Google Sign-In. Please use the "Sign in with Google" button.');
    }

    // Verify password for local users
    if (!user.password) {
        throw new Error('Invalid authentication method');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid password');
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || '', { expiresIn: '1h' });
    return { token, user };
}

export async function recoverUserPassword(email: string) {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('No user associated with email');
    }

    // Check if user is using OAuth
    if (user.authProvider === 'google') {
        throw new Error('This account uses Google Sign-In. Password recovery is not available for Google accounts.');
    }

    const mailjet = new Mailjet({
        apiKey: process.env.MJ_APIKEY_PUBLIC || '',
        apiSecret: process.env.MJ_APIKEY_PRIVATE || '',
    });

    const newPassword = Math.random().toString(36).slice(-10);
    const saltRounds = 10;
    const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);

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
                    Subject: 'Recovery password',
                    TextPart: 'You requested to reset your password. Your new password is ' + newPassword + '. You may change it at your profile page.',
                    HTMLPart: '<h3>You requested to reset your password.</h3><br />Your new password is ' + newPassword + '. You may change it at your profile page.',
                },
            ],
        });
    } catch (err) {
        console.error(err);
    }

    user.password = newHashedPassword;
    await user.save();
    return { message: 'Recovery mail sent.' };
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
