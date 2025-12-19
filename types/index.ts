// Semester term types
export type SemesterTerm = 'Fall' | 'Spring' | 'Summer';

export type Semester = {
  year: number;
  term: SemesterTerm;
};

// Grade attempt (for tracking multiple test attempts/retakes)
export type GradeAttempt = {
  grade: number;
  date?: string; // ISO date string
  label?: string; // e.g., "First attempt", "Retake", "Final exam"
  isFinal?: boolean; // Whether this is the final grade used for GPA
};

// Course status for moderation (in the Course database)
export type CourseApprovalStatus = 'approved' | 'pending' | 'rejected';

// Course createdBy user reference
export type CreatedByUser = {
  _id: string;
  username: string;
  email?: string;
};

// Course in the shared database
export type Course = {
  _id?: string;
  code: string;           // "CS101"
  name: string;           // "Intro to Computer Science"
  credits: number;        // 1-15
  department: string;     // "Computer Science", "Math", etc.
  status: CourseApprovalStatus;
  createdBy?: CreatedByUser;
  usageCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

// User's course - references a Course with user-specific data
export type UserCourse = {
  _id?: string;
  course: Course;         // Populated reference to Course in database
  semester: Semester;     // When the user is taking it
  grades?: GradeAttempt[]; // User's grades for this course
};

// Runtime-computed course status based on semester
export type CourseRuntimeStatus = 'planned' | 'in-progress' | 'completed';

// Helper to compute course status at runtime
export function getCourseRuntimeStatus(userCourse: UserCourse, currentSemester: Semester): CourseRuntimeStatus {
  if (!userCourse.semester) return 'planned';
  
  const semesterOrder = { 'Spring': 0, 'Summer': 1, 'Fall': 2 };
  const courseValue = userCourse.semester.year * 10 + semesterOrder[userCourse.semester.term];
  const currentValue = currentSemester.year * 10 + semesterOrder[currentSemester.term];
  
  if (courseValue < currentValue) return 'completed';
  if (courseValue === currentValue) return 'in-progress';
  return 'planned';
}

// Helper to get current semester
export function getCurrentSemester(): Semester {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  let term: SemesterTerm = 'Fall';
  if (month >= 2 && month < 7) term = 'Spring';
  else if (month >= 7 && month < 9) term = 'Summer';
  
  return { year, term };
}

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
  courses: UserCourse[];
  degree?: Degree;
  savedJobs?: JobListing[];
  // Onboarding fields
  startYear?: number;
  expectedGraduationYear?: number;
  currentYear?: number;
  onboardingCompleted?: boolean;
  isAdmin?: boolean;
};

export type UserProfileData = {
  username: string;
  email: string;
  major: string;
};

export type CourseFormData = {
  courseId: string;       // Reference to Course in database
  semester: Semester;
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
