// Centralized validation rules and helpers
// Used by both frontend and backend to ensure consistency

// ===========================================
// Validation Constants
// ===========================================

export const VALIDATION_RULES = {
  password: {
    minLength: 6,
    messages: {
      required: 'Password is required',
      tooShort: 'Password must be at least 6 characters',
      mismatch: 'Passwords do not match',
    },
  },
  username: {
    minLength: 3,
    messages: {
      required: 'Username is required',
      tooShort: 'Username must be at least 3 characters',
      taken: 'Username already exists',
    },
  },
  email: {
    // Standard email regex pattern
    pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    messages: {
      required: 'Email is required',
      invalid: 'Invalid email address',
      taken: 'Email already in use',
    },
  },
  course: {
    grade: {
      min: 0,
      max: 100,
      messages: {
        invalid: 'Grade must be between 0 and 100',
        required: 'Please enter a grade for completed courses',
      },
    },
    credits: {
      min: 0,
      messages: {
        invalid: 'Course credit must be greater than 0',
      },
    },
    name: {
      messages: {
        required: 'Course name is required',
      },
    },
  },
  degree: {
    messages: {
      majorRequired: 'Please select your major',
      typeRequired: 'Please select your degree type',
      graduationBeforeStart: 'Graduation year must be after start year',
    },
  },
} as const;

// ===========================================
// Validation Helper Functions
// ===========================================

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Password validation
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: VALIDATION_RULES.password.messages.required };
  }
  if (password.length < VALIDATION_RULES.password.minLength) {
    return { isValid: false, error: VALIDATION_RULES.password.messages.tooShort };
  }
  return { isValid: true };
}

export function validatePasswordMatch(password: string, confirmPassword: string): ValidationResult {
  if (password !== confirmPassword) {
    return { isValid: false, error: VALIDATION_RULES.password.messages.mismatch };
  }
  return { isValid: true };
}

// Username validation
export function validateUsername(username: string): ValidationResult {
  if (!username || !username.trim()) {
    return { isValid: false, error: VALIDATION_RULES.username.messages.required };
  }
  if (username.trim().length < VALIDATION_RULES.username.minLength) {
    return { isValid: false, error: VALIDATION_RULES.username.messages.tooShort };
  }
  return { isValid: true };
}

// Email validation
export function validateEmail(email: string): ValidationResult {
  if (!email || !email.trim()) {
    return { isValid: false, error: VALIDATION_RULES.email.messages.required };
  }
  if (!VALIDATION_RULES.email.pattern.test(email)) {
    return { isValid: false, error: VALIDATION_RULES.email.messages.invalid };
  }
  return { isValid: true };
}

// Grade validation
export function validateGrade(grade: number | undefined | null): ValidationResult {
  if (grade === undefined || grade === null) {
    return { isValid: false, error: VALIDATION_RULES.course.grade.messages.required };
  }
  if (grade < VALIDATION_RULES.course.grade.min || grade > VALIDATION_RULES.course.grade.max) {
    return { isValid: false, error: VALIDATION_RULES.course.grade.messages.invalid };
  }
  return { isValid: true };
}

// Credits validation
export function validateCredits(credits: number | undefined | null): ValidationResult {
  if (credits === undefined || credits === null || credits <= VALIDATION_RULES.course.credits.min) {
    return { isValid: false, error: VALIDATION_RULES.course.credits.messages.invalid };
  }
  return { isValid: true };
}

// Course name validation
export function validateCourseName(name: string): ValidationResult {
  if (!name || !name.trim()) {
    return { isValid: false, error: VALIDATION_RULES.course.name.messages.required };
  }
  return { isValid: true };
}

// ===========================================
// Compound Validation Functions
// ===========================================

export interface AccountValidationErrors {
  username?: string;
  password?: string;
  confirmPassword?: string;
  email?: string;
}

export function validateAccountForm(data: {
  username: string;
  password: string;
  confirmPassword?: string;
  email?: string;
}): AccountValidationErrors {
  const errors: AccountValidationErrors = {};

  const usernameResult = validateUsername(data.username);
  if (!usernameResult.isValid) {
    errors.username = usernameResult.error;
  }

  const passwordResult = validatePassword(data.password);
  if (!passwordResult.isValid) {
    errors.password = passwordResult.error;
  }

  if (data.confirmPassword !== undefined) {
    const matchResult = validatePasswordMatch(data.password, data.confirmPassword);
    if (!matchResult.isValid) {
      errors.confirmPassword = matchResult.error;
    }
  }

  if (data.email !== undefined) {
    const emailResult = validateEmail(data.email);
    if (!emailResult.isValid) {
      errors.email = emailResult.error;
    }
  }

  return errors;
}

export interface ChangePasswordValidationErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export function validateChangePasswordForm(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}): ChangePasswordValidationErrors {
  const errors: ChangePasswordValidationErrors = {};

  if (!data.currentPassword) {
    errors.currentPassword = 'Current password is required';
  }

  const newPasswordResult = validatePassword(data.newPassword);
  if (!newPasswordResult.isValid) {
    errors.newPassword = newPasswordResult.error;
  }

  if (data.confirmPassword !== undefined) {
    const matchResult = validatePasswordMatch(data.newPassword, data.confirmPassword);
    if (!matchResult.isValid) {
      errors.confirmPassword = matchResult.error;
    }
  }

  return errors;
}

export interface ProfileValidationErrors {
  username?: string;
  email?: string;
}

export function validateProfileForm(data: {
  username: string;
  email: string;
}): ProfileValidationErrors {
  const errors: ProfileValidationErrors = {};

  const usernameResult = validateUsername(data.username);
  if (!usernameResult.isValid) {
    errors.username = usernameResult.error;
  }

  const emailResult = validateEmail(data.email);
  if (!emailResult.isValid) {
    errors.email = emailResult.error;
  }

  return errors;
}
