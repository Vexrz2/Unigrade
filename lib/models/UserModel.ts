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

const savedJobSchema = new mongoose.Schema({
    job_id: { type: String, required: true },
    job_title: { type: String },
    job_job_title: { type: String },
    job_description: { type: String },
    employer_name: { type: String },
    employer_logo: { type: String },
    job_city: { type: String },
    job_country: { type: String },
    job_apply_quality_score: { type: Number },
    job_apply_link: { type: String },
    job_required_skills: [{ type: String }],
    job_posted_at_timestamp: { type: Number },
}, { _id: false });

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Optional for OAuth users
    email: { type: String, required: true, unique: true },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    googleId: { type: String, unique: true, sparse: true }, // Unique Google ID for OAuth users
    profilePicture: { type: String }, // Profile picture URL from OAuth provider
    emailVerified: { type: Boolean, default: false }, // OAuth users are pre-verified
    courses: [courseSchema],
    degree: degreeSchema,
    savedJobs: [savedJobSchema], // Array of saved job objects
});

// Delete the cached model in development to allow hot reload
if (process.env.NODE_ENV !== 'production' && mongoose.models.User) {
    delete mongoose.models.User;
}

export const User = mongoose.model('User', userSchema);
