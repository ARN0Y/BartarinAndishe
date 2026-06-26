-- Rename legacy grade key to prek2_repeat
UPDATE "GradeBirthRange"
SET "gradeKey" = 'prek2_repeat', "gradeLabel" = 'تکرار پیش‌دبستانی ۲'
WHERE "gradeKey" = 'grade1';

UPDATE "PreRegistration"
SET "gradeKey" = 'prek2_repeat', "gradeLevel" = 'تکرار پیش‌دبستانی ۲'
WHERE "gradeKey" = 'grade1';
