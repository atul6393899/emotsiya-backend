export const ROLES = {
  ADMIN: 'admin',
  SCHOOL: 'school',
  GOVERNMENT: 'government',
  STUDENT: 'student',
} as const; //

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES: Role[] = [ROLES.ADMIN, ROLES.SCHOOL, ROLES.GOVERNMENT, ROLES.STUDENT];
