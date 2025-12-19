import mongoose from 'mongoose';

// Single Course model - both approved and pending courses
const courseSchema = new mongoose.Schema({
    // Identity
    code: { type: String, required: true }, // "CS101"
    name: { type: String, required: true }, // "Intro to Computer Science"
    credits: { type: Number, required: true, min: 1, max: 15 }, // 1-15
    department: { type: String, required: true }, // "Computer Science", "Math", etc.

    // Moderation
    status: { 
        type: String, 
        enum: ['approved', 'pending', 'rejected'], 
        default: 'pending',
        required: true 
    },

    // Metadata
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    usageCount: { type: Number, default: 0 },
}, {
    timestamps: true, // Adds createdAt and updatedAt automatically
});

// Create indexes for searching
courseSchema.index({ name: 'text', code: 'text', department: 'text' });
courseSchema.index({ status: 1, department: 1 });
courseSchema.index({ usageCount: -1 });
courseSchema.index({ code: 1 }, { unique: true, sparse: true });

// Delete cached model in development to allow hot reload
if (process.env.NODE_ENV !== 'production' && mongoose.models.Course) {
    delete mongoose.models.Course;
}

export const Course = mongoose.model('Course', courseSchema);
