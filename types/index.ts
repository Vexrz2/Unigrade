export type Course = {
  _id?: string;
  courseName?: string;
  courseCode?: string;
  courseCredit: number;
  courseGrade: number;
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
  courses: Course[];
  degree?: Degree;
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
