import mongoose from 'mongoose';

// Grade attempt subdocument schema (for tracking retakes)
const gradeAttemptSchema = new mongoose.Schema({
    grade: { type: Number, required: true, min: 0, max: 100 },
    date: { type: String }, // ISO date string
    label: { type: String }, // e.g., "First attempt", "Retake"
    isFinal: { type: Boolean, default: false },
}, { _id: false });

// Semester subdocument schema
const semesterSchema = new mongoose.Schema({
    year: { type: Number, required: true },
    term: { type: String, enum: ['Fall', 'Spring', 'Summer'], required: true },
}, { _id: false });

const courseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    credits: { type: Number, required: true },
    grades: [gradeAttemptSchema], // Array of grade attempts
    semester: semesterSchema,
}, {timestamps: true});

const degreeSchema = new mongoose.Schema({
    major: { type: String, default: 'Other' },
    creditRequirement: { type: Number, default: 120, required: true },
    type: { type: String },
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
    profilePicture: { type: String }, // Profile picture URL
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
