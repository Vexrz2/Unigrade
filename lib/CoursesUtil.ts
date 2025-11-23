import _ from 'lodash';
import type { Course, User } from '../types';

export const getWeightedAverage = (courses: Course[]) => {
  const sumWeights = _.reduce(courses, (prev, curr, i) => prev + courses[i].courseCredit, 0);
  const sumWeightedAverage = _.reduce(
    courses,
    (prev, curr, i) => prev + (courses[i].courseGrade * courses[i].courseCredit) / sumWeights,
    0
  );
  return sumWeightedAverage;
};

export const getWorstCourse = (courses: Course[]) => {
  let maxImprovement = 0; // find course which when removed increases the avg the most
  let worstCourse = courses[0];
  const avg = getWeightedAverage(courses);
  courses.forEach((course) => {
    const newAvg = getWeightedAverage(_.without(courses, course));
    if (newAvg - avg > maxImprovement) {
      maxImprovement = newAvg - avg;
      worstCourse = course;
    }
  });
  return worstCourse;
};

export const getMaxImprovement = (courses: Course[]) => {
  let maxImprovement = 0; // find course which when removed increases the avg the most
  const avg = getWeightedAverage(courses);
  courses.forEach((course) => {
    const newAvg = getWeightedAverage(_.without(courses, course));
    if (newAvg - avg > maxImprovement) {
      maxImprovement = newAvg - avg;
    }
  });
  return maxImprovement;
};

export const getDegreeProgress = (user: User | null) => {
  if (!user) return NaN;
  const totalCredits = getTotalCredit(user.courses);
  const creditRequirement = user.degree.creditRequirement;
  return Math.min((totalCredits / creditRequirement) * 100, 100);
};

export const getFinalAverageRange = (user: User | null) => {
  if (!user) return NaN as any;
  const totalCredits = _.sumBy(user.courses, (course) => course.courseCredit);
  const creditRequirement = user.degree.creditRequirement;
  const weightedAverage = getWeightedAverage(user.courses);
  const low = (weightedAverage * totalCredits) / creditRequirement + ((creditRequirement - totalCredits) * 60) / creditRequirement;
  const high = (weightedAverage * totalCredits) / creditRequirement + ((creditRequirement - totalCredits) * 100) / creditRequirement;
  const softLow = weightedAverage - (weightedAverage - low) / 5;
  const softHigh = (weightedAverage + high) / 2;
  return { low, high, softLow, softHigh };
};

export const getTotalCredit = (courses: Course[]) => {
  return _.sumBy(courses, (course) => course.courseCredit);
};
