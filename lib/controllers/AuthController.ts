import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@/lib/models/UserModel';
import Mailjet from 'node-mailjet';

export async function registerUser(data: {
    username: string;
    password: string;
    confirmPassword: string;
    email: string;
    major: string;
}) {
    const { username, password, confirmPassword, email, major } = data;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        throw new Error('User already exists');
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
        throw new Error('Email already in use');
    }

    const isValidEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
    if (!isValidEmail) {
        throw new Error('Invalid Email');
    }

    if (password !== confirmPassword) {
        throw new Error("Passwords don't match");
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create and save the new user
    const newUser = new User({
        username,
        email,
        password: hashedPassword,
        degree: { type: '', major: major, creditRequirement: 120 },
        courses: [],
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

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        throw new Error('Invalid password');
    }

    const saltRounds = 10;
    const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = newHashedPassword;
    await user.save();
    return { message: 'Password changed.' };
}
