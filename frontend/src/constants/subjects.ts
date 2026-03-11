export const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
  "History",
  "Economics",
  "Business",
  "Engineering",
  "Other",
] as const;

export type Subject = (typeof SUBJECTS)[number];
