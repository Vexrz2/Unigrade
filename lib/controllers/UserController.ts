import { User } from '@/lib/models/UserModel';
import { validateUsername, validateEmail, VALIDATION_RULES } from '@/lib/validation';

export async function getUser(userId: string) {
    const user = await User.findById(userId).select('-password -passwordResetToken -passwordResetExpires');
    if (!user) {
        throw new Error('User not found');
    }
    return user;
}

export async function updateUser(userId: string, data: { username: string; email: string; profilePicture?: string }) {
    const { username, email, profilePicture } = data;
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

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

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (user.username !== username && existingUser) {
        throw new Error(VALIDATION_RULES.username.messages.taken);
    }

    const existingEmail = await User.findOne({ email });
    if (user.email !== email && existingEmail) {
        throw new Error(VALIDATION_RULES.email.messages.taken);
    }

    const updateData: Record<string, unknown> = { username, email };
    if (profilePicture) {
        updateData.profilePicture = profilePicture;
    }

    await User.findByIdAndUpdate(userId, updateData);
    const updatedUser = await User.findById(userId).select('-password -passwordResetToken -passwordResetExpires');
    return updatedUser;
}

export async function deleteUser(userId: string) {
    await User.findByIdAndDelete(userId);
    return { message: 'User account deleted' };
}