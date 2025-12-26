import { User } from '@/lib/models/UserModel';
import { validateDegreeType, validateMajor, validateCreditRequirement } from '@/lib/validation';

export async function updateDegree(userId: string, data: { degreeType: string; major: string; creditRequirement: number }) {
    const { degreeType, major, creditRequirement } = data;
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    // Validate inputs using centralized validation
    const degreeTypeValidation = validateDegreeType(degreeType);
    if (!degreeTypeValidation.isValid) {
        throw new Error(degreeTypeValidation.error);
    }

    const majorValidation = validateMajor(major);
    if (!majorValidation.isValid) {
        throw new Error(majorValidation.error);
    }

    const creditValidation = validateCreditRequirement(creditRequirement);
    if (!creditValidation.isValid) {
        throw new Error(creditValidation.error);
    }

    await User.findByIdAndUpdate(userId, {
        degree: { major, type: degreeType, creditRequirement },
    });

    const updatedUser = await User.findById(userId).select('-password -passwordResetToken -passwordResetExpires');
    return updatedUser;
}
