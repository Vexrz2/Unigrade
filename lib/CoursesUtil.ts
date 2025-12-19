import _ from 'lodash';
import type { Course, User, Semester, SemesterTerm, CourseStatus } from '../types';

/**
 * Get the current semester based on the current date
 */
export const getCurrentSemester = (): Semester => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  let term: SemesterTerm;
  if (month >= 0 && month < 5) {
    term = 'Spring';
  } else if (month >= 5 && month < 8) {
    term = 'Summer';
  } else {
    term = 'Fall';
  }
  
  return { year, term };
};

/**
 * Compare two semesters: returns -1 if a < b, 0 if equal, 1 if a > b
 */
export const compareSemesters = (a: Semester, b: Semester): number => {
  const termOrder: Record<SemesterTerm, number> = { 'Spring': 0, 'Summer': 1, 'Fall': 2 };
  const aVal = a.year * 10 + termOrder[a.term];
  const bVal = b.year * 10 + termOrder[b.term];
  
  if (aVal < bVal) return -1;
  if (aVal > bVal) return 1;
  return 0;
};

/**
 * Infer course status from semester
 * - Past semesters: completed
 * - Current semester: in-progress
 * - Future semesters: planned
 * - No semester: planned
 */
export const getCourseStatus = (semester?: Semester): CourseStatus => {
  if (!semester) return 'planned';
  
  const current = getCurrentSemester();
  const comparison = compareSemesters(semester, current);
  
  if (comparison < 0) return 'completed';
  if (comparison === 0) return 'in-progress';
  return 'planned';
};

/**
 * Get the final grade for a course (from grades array)
 */
export const getFinalGrade = (course: Course): number | undefined => {
  if (course.grades && course.grades.length > 0) {
    const finalAttempt = course.grades.find(g => g.isFinal) || course.grades[course.grades.length - 1];
    return finalAttempt.grade;
  }
  return undefined;
};

/**
 * Get only completed courses with valid grades
 */
export const getCompletedCoursesWithGrades = (courses: Course[]): Course[] => {
  return courses.filter(c => getCourseStatus(c.semester) === 'completed' && getFinalGrade(c) !== undefined);
};

/**
 * Calculate weighted average GPA for courses
 * Only considers completed courses with grades
 */
export const getWeightedAverage = (courses: Course[]) => {
  const completedCourses = getCompletedCoursesWithGrades(courses);
  if (completedCourses.length === 0) return 0;
  
  const sumWeights = _.reduce(completedCourses, (prev, curr) => prev + curr.credits, 0);
  if (sumWeights === 0) return 0;
  
  const sumWeightedAverage = _.reduce(
    completedCourses,
    (prev, curr) => {
      const grade = getFinalGrade(curr) ?? 0;
      return prev + (grade * curr.credits) / sumWeights;
    },
    0
  );
  return sumWeightedAverage;
};

/**
 * Get semester key for sorting/grouping
 */
export const getSemesterKey = (semester?: Semester): string => {
  if (!semester) return 'unassigned';
  return `${semester.year}-${semester.term}`;
};

/**
 * Get semester sort value for ordering
 */
export const semesterSortValue = (semester?: Semester): number => {
  if (!semester) return 0;
  const termOrder: Record<SemesterTerm, number> = { 'Spring': 0, 'Summer': 1, 'Fall': 2 };
  return semester.year * 10 + (termOrder[semester.term] || 0);
};

/**
 * Group courses by semester
 */
export const groupCoursesBySemester = (courses: Course[]): Map<string, Course[]> => {
  const grouped = new Map<string, Course[]>();
  
  courses.forEach(course => {
    const key = getSemesterKey(course.semester);
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(course);
  });
  
  return grouped;
};

/**
 * Calculate GPA for a specific semester
 */
export const getSemesterGPA = (courses: Course[], semester: Semester): number => {
  const semesterCourses = courses.filter(c => 
    c.semester?.year === semester.year && 
    c.semester?.term === semester.term
  );
  return getWeightedAverage(semesterCourses);
};

/**
 * Get GPA by semester for all semesters
 */
export const getGPABySemester = (courses: Course[]): { semester: Semester; gpa: number; credits: number }[] => {
  const grouped = groupCoursesBySemester(courses);
  const results: { semester: Semester; gpa: number; credits: number }[] = [];
  
  grouped.forEach((semesterCourses, key) => {
    if (key === 'unassigned') return;
    
    const [year, term] = key.split('-');
    const semester = { year: Number(year), term: term as SemesterTerm };
    const completedCourses = getCompletedCoursesWithGrades(semesterCourses);
    
    if (completedCourses.length > 0) {
      results.push({
        semester,
        gpa: getWeightedAverage(semesterCourses),
        credits: _.sumBy(completedCourses, c => c.credits),
      });
    }
  });
  
  // Sort by semester
  return results.sort((a, b) => semesterSortValue(a.semester) - semesterSortValue(b.semester));
};

/**
 * Get cumulative GPA up to and including a specific semester
 */
export const getCumulativeGPA = (courses: Course[], upToSemester: Semester): number => {
  const targetValue = semesterSortValue(upToSemester);
  const relevantCourses = courses.filter(c => 
    c.semester && semesterSortValue(c.semester) <= targetValue
  );
  return getWeightedAverage(relevantCourses);
};

/**
 * Find the course that lowers the average the most
 */
export const getWorstCourse = (courses: Course[]) => {
  const completedCourses = getCompletedCoursesWithGrades(courses);
  if (completedCourses.length === 0) return completedCourses[0];
  
  let maxImprovement = 0;
  let worstCourse = completedCourses[0];
  const avg = getWeightedAverage(completedCourses);
  
  completedCourses.forEach((course) => {
    const newAvg = getWeightedAverage(_.without(completedCourses, course));
    if (newAvg - avg > maxImprovement) {
      maxImprovement = newAvg - avg;
      worstCourse = course;
    }
  });
  console.log(worstCourse);
  return worstCourse;
};

/**
 * Calculate how much the average would improve if worst course is removed
 */
export const getMaxImprovement = (courses: Course[]) => {
  const completedCourses = getCompletedCoursesWithGrades(courses);
  if (completedCourses.length === 0) return 0;
  
  let maxImprovement = 0;
  const avg = getWeightedAverage(completedCourses);
  
  completedCourses.forEach((course) => {
    const newAvg = getWeightedAverage(_.without(completedCourses, course));
    if (newAvg - avg > maxImprovement) {
      maxImprovement = newAvg - avg;
    }
  });
  return maxImprovement;
};

/**
 * Calculate degree completion progress
 */
export const getDegreeProgress = (user: User | null) => {
  if (!user) return NaN;
  // Count all courses (completed + in-progress count towards progress)
  const countableStatuses = ['completed', 'in-progress'];
  const countableCourses = user.courses.filter(c => countableStatuses.includes(getCourseStatus(c.semester)));
  const totalCredits = getTotalCredit(countableCourses);
  const creditRequirement = user.degree?.creditRequirement ?? 120;
  return Math.min((totalCredits / creditRequirement) * 100, 100);
};

/**
 * Get completed credits only
 */
export const getCompletedCredits = (courses: Course[]): number => {
  const completedCourses = courses.filter(c => getCourseStatus(c.semester) === 'completed');
  return _.sumBy(completedCourses, c => c.credits);
};

/**
 * Get in-progress credits
 */
export const getInProgressCredits = (courses: Course[]): number => {
  const inProgressCourses = courses.filter(c => getCourseStatus(c.semester) === 'in-progress');
  return _.sumBy(inProgressCourses, c => c.credits);
};

/**
 * Get planned credits
 */
export const getPlannedCredits = (courses: Course[]): number => {
  const plannedCourses = courses.filter(c => getCourseStatus(c.semester) === 'planned');
  return _.sumBy(plannedCourses, c => c.credits);
};

/**
 * Calculate final grade range based on remaining credits
 */
export const getFinalAverageRange = (user: User | null) => {
  if (!user) return { low: 0, high: 0, softLow: 0, softHigh: 0 };
  
  const completedCourses = getCompletedCoursesWithGrades(user.courses);
  const totalCredits = _.sumBy(completedCourses, (course) => course.credits);
  const creditRequirement = user.degree?.creditRequirement ?? 120;
  const weightedAverage = getWeightedAverage(completedCourses);
  
  if (totalCredits === 0) {
    return { low: 60, high: 100, softLow: 70, softHigh: 90 };
  }
  
  const low = (weightedAverage * totalCredits) / creditRequirement + ((creditRequirement - totalCredits) * 60) / creditRequirement;
  const high = (weightedAverage * totalCredits) / creditRequirement + ((creditRequirement - totalCredits) * 100) / creditRequirement;
  const softLow = weightedAverage - (weightedAverage - low) / 5;
  const softHigh = (weightedAverage + high) / 2;
  return { low, high, softLow, softHigh };
};

/**
 * Get total credits from courses
 */
export const getTotalCredit = (courses: Course[]) => {
  return _.sumBy(courses, (course) => course.credits);
};

/**
 * Get courses by status
 */
export const getCoursesByStatus = (courses: Course[], status: string): Course[] => {
  return courses.filter(c => getCourseStatus(c.semester) === status);
};
