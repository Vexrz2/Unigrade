import _ from 'lodash';
import type { Course, User, Semester, SemesterTerm } from '../types';

/**
 * Get the final grade for a course (from grades array or legacy courseGrade)
 */
export const getFinalGrade = (course: Course): number | undefined => {
  if (course.grades && course.grades.length > 0) {
    const finalAttempt = course.grades.find(g => g.isFinal) || course.grades[course.grades.length - 1];
    return finalAttempt.grade;
  }
  return course.courseGrade;
};

/**
 * Get only completed courses with valid grades
 */
export const getCompletedCoursesWithGrades = (courses: Course[]): Course[] => {
  return courses.filter(c => c.status === 'completed' && getFinalGrade(c) !== undefined);
};

/**
 * Calculate weighted average GPA for courses
 * Only considers completed courses with grades
 */
export const getWeightedAverage = (courses: Course[]) => {
  const completedCourses = getCompletedCoursesWithGrades(courses);
  if (completedCourses.length === 0) return 0;
  
  const sumWeights = _.reduce(completedCourses, (prev, curr) => prev + curr.courseCredit, 0);
  if (sumWeights === 0) return 0;
  
  const sumWeightedAverage = _.reduce(
    completedCourses,
    (prev, curr) => {
      const grade = getFinalGrade(curr) ?? 0;
      return prev + (grade * curr.courseCredit) / sumWeights;
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
        credits: _.sumBy(completedCourses, c => c.courseCredit),
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
  const countableCourses = user.courses.filter(c => countableStatuses.includes(c.status));
  const totalCredits = getTotalCredit(countableCourses);
  const creditRequirement = user.degree?.creditRequirement ?? 120;
  return Math.min((totalCredits / creditRequirement) * 100, 100);
};

/**
 * Get completed credits only
 */
export const getCompletedCredits = (courses: Course[]): number => {
  const completedCourses = courses.filter(c => c.status === 'completed');
  return _.sumBy(completedCourses, c => c.courseCredit);
};

/**
 * Get in-progress credits
 */
export const getInProgressCredits = (courses: Course[]): number => {
  const inProgressCourses = courses.filter(c => c.status === 'in-progress');
  return _.sumBy(inProgressCourses, c => c.courseCredit);
};

/**
 * Get planned credits
 */
export const getPlannedCredits = (courses: Course[]): number => {
  const plannedCourses = courses.filter(c => c.status === 'planned');
  return _.sumBy(plannedCourses, c => c.courseCredit);
};

/**
 * Calculate final grade range based on remaining credits
 */
export const getFinalAverageRange = (user: User | null) => {
  if (!user) return { low: 0, high: 0, softLow: 0, softHigh: 0 };
  
  const completedCourses = getCompletedCoursesWithGrades(user.courses);
  const totalCredits = _.sumBy(completedCourses, (course) => course.courseCredit);
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
  return _.sumBy(courses, (course) => course.courseCredit);
};

/**
 * Get courses by status
 */
export const getCoursesByStatus = (courses: Course[], status: string): Course[] => {
  return courses.filter(c => c.status === status);
};

/**
 * Get courses by category
 */
export const getCoursesByCategory = (courses: Course[], category: string): Course[] => {
  return courses.filter(c => c.category === category);
};
