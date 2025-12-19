// Semester term types
export type SemesterTerm = 'Fall' | 'Spring' | 'Summer';

export type Semester = {
  year: number;
  term: SemesterTerm;
};

// Course status types
export type CourseStatus = 'planned' | 'in-progress' | 'completed';

// Grade attempt (for tracking multiple test attempts/retakes)
export type GradeAttempt = {
  grade: number;
  label?: string; // e.g., "First attempt", "Retake", "Final exam"
  isFinal?: boolean; // Whether this is the final grade used for GPA
};

export type Course = {
  _id?: string;
  name: string;
  credits: number;
  grades?: GradeAttempt[];
  semester?: Semester;
};

export type Degree = {
  type: string;
  major: string;
  creditRequirement: number;
};

export type User = {
  username: string;
  _id?: string;
  name?: string;
  email?: string;
  authProvider?: 'local' | 'google';
  googleId?: string;
  profilePicture?: string;
  emailVerified?: boolean;
  courses: Course[];
  degree?: Degree;
  savedJobs?: JobListing[];
};

export type UserProfileData = {
  username: string;
  email: string;
  major: string;
};

export type CourseFormData = {
  name: string;
  credits: number | string;
  semester?: Semester;
  grades?: GradeAttempt[];
};

export type JobListing = {
  job_id?: string;
  job_title?: string;
  job_job_title?: string;
  job_description?: string;
  employer_name?: string;
  employer_logo: string;
  job_city?: string;
  job_country?: string;
  job_apply_quality_score?: number;
  job_apply_link?: string;
  job_required_skills?: string[];
  job_posted_at_timestamp?: number;
};

export type Nullable<T> = T | null;
