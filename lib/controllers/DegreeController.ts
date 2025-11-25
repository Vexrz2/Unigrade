import { User } from '@/lib/models/UserModel';

export async function updateDegree(userId: string, data: { degreeType: string; major: string; creditRequirement: number }) {
    const { degreeType, major, creditRequirement } = data;
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    await User.findByIdAndUpdate(userId, {
        degree: { major, type: degreeType, creditRequirement },
    });

    const updatedUser = await User.findById(userId);
    return updatedUser;
}
