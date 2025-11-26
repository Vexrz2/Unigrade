import { User } from '@/lib/models/UserModel';

export async function getUser(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    return user;
}

export async function updateUser(userId: string, data: { username: string; email: string; major: string }) {
    const { username, email, major } = data;
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (user.username !== username && existingUser) {
        throw new Error('User already exists');
    }

    const existingEmail = await User.findOne({ email });
    if (user.email !== email && existingEmail) {
        throw new Error('Email already in use');
    }

    const isValidEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
    if (!isValidEmail) {
        throw new Error('Invalid Email');
    }

    await User.findByIdAndUpdate(userId, { username, email, degree: { major } });
    const updatedUser = await User.findById(userId);
    return updatedUser;
}

export async function deleteUser(userId: string) {
    await User.findByIdAndDelete(userId);
    return { message: 'User account deleted' };
}