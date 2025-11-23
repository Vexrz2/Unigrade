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

export type Nullable<T> = T | null;
