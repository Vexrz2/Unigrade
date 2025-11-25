import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    courseName: { type: String, required: true },
    courseGrade: { type: Number, required: true, min: 0, max: 100 },
    courseCredit: { type: Number, required: true },
});

const degreeSchema = new mongoose.Schema({
    major: { type: String },
    creditRequirement: { type: Number, default: 120, required: true },
    type: { type: String, default: 'Other' },
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    courses: [courseSchema],
    degree: degreeSchema,
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
