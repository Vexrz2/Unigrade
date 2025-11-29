export type Course = {
  _id?: string;
  courseName?: string;
  courseCode?: string;
  courseCredit: number;
  courseGrade: number;
  [key: string]: any;
};

export type Degree = {
  creditRequirement: number;
  [key: string]: any;
};

export type User = {
  _id?: string;
  name?: string;
  email?: string;
  courses: Course[];
  degree: Degree;
  [key: string]: any;
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
  job_title?: string;
  job_job_title?: string;
  employer_name?: string;
  employer_logo: string;
  job_city?: string;
  job_country?: string;
  job_apply_quality_score?: number;
  [key: string]: any;
};

export type Nullable<T> = T | null;
