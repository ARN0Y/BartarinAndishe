-- Operational indexes for multi-year student, finance, and parent-message scale.
CREATE INDEX "Student_registrationStatus_academicYear_idx" ON "Student"("registrationStatus", "academicYear");
CREATE INDEX "Student_academicYear_lastName_firstName_idx" ON "Student"("academicYear", "lastName", "firstName");

CREATE INDEX "PaymentSchedule_studentId_academicYear_idx" ON "PaymentSchedule"("studentId", "academicYear");
CREATE INDEX "PaymentSchedule_academicYear_dueYear_dueMonth_idx" ON "PaymentSchedule"("academicYear", "dueYear", "dueMonth");

CREATE INDEX "Payment_academicYear_status_paymentDate_idx" ON "Payment"("academicYear", "status", "paymentDate");

CREATE INDEX "PreRegistration_status_academicYear_idx" ON "PreRegistration"("status", "academicYear");

CREATE INDEX "ManualPayment_studentId_academicYear_paymentDate_idx" ON "ManualPayment"("studentId", "academicYear", "paymentDate");

CREATE INDEX "Message_toStudentId_isRead_createdAt_idx" ON "Message"("toStudentId", "isRead", "createdAt");
