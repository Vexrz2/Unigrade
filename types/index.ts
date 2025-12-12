// Semester term types
export type SemesterTerm = 'Fall' | 'Spring' | 'Summer';

export type Semester = {
  year: number;
  term: SemesterTerm;
};

// Course status types
export type CourseStatus = 'planned' | 'in-progress' | 'completed';

// Course category types
export type CourseCategory = 'required' | 'elective' | 'general';

// Grade attempt (for tracking multiple test attempts/retakes)
export type GradeAttempt = {
  grade: number;
  date?: string; // ISO date string
  label?: string; // e.g., "First attempt", "Retake", "Final exam"
  isFinal?: boolean; // Whether this is the final grade used for GPA
};

export type Course = {
  _id?: string;
  courseName?: string;
  courseCredit: number;
  courseGrade?: number;
  grades?: GradeAttempt[];
  semester?: Semester;
  status: CourseStatus;
  passed?: boolean | null;
  category?: CourseCategory;
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
  courseName: string;
  courseGrade: number | string;
  courseCredit: number | string;
  semester?: Semester;
  status: CourseStatus;
  passed?: boolean | null;
  category?: CourseCategory;
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
