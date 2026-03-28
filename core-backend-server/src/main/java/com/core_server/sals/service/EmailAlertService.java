package com.core_server.sals.service;

import com.core_server.sals.repository.AttendanceRepository;
import com.core_server.sals.repository.ClassSessionRepository;
import com.core_server.sals.repository.SubjectRepository;
import com.core_server.sals.repository.UserRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import com.core_server.sals.entity.Subject;
import com.core_server.sals.model.User;

import java.util.List;


@Service
public class EmailAlertService {

    @Autowired private JavaMailSender mailSender;
    @Autowired private SubjectRepository subjectRepo;
    @Autowired private AttendanceRepository attendanceRepo;
    @Autowired private ClassSessionRepository sessionRepo;
    @Autowired private UserRepository userRepo;

    @Value("${spring.mail.username}")
    private String fromEmail;

    private final double CRITICAL_THRESHOLD = 75.0;


     // ------- 1. Scans all students and subjects. If attendance < 75%, sends an email. --------

    public int runSystemWideAudit() {
        int emailsSent = 0;

        // 1.1) Fetch all users who are strictly students
        List<User> allStudents = userRepo.findByRole("STUDENT");

        // 1.2) Fetch all active subjects
        List<Subject> allSubjects = subjectRepo.findAll();

        for (User student : allStudents) {
            for (Subject subject : allSubjects) {

                // 1.3) Find out how many total sessions have been held for this subject
                long totalSessionsHeld = sessionRepo.countBySubject(subject);

                // 1.4) If no classes have been held yet, skip this subject to avoid dividing by zero
                if (totalSessionsHeld == 0) {
                    continue;
                }

                // 1.5) Use our custom @Query to get the exact attended count!
                long sessionsAttended = attendanceRepo.countByStudentIdAndSubjectId(
                        student.getCustomId(),
                        subject.getId()
                );

                // 1.6) Calculate the real percentage
                double calculatedAttendance = ((double) sessionsAttended / totalSessionsHeld) * 100.0;

                // 1.7) Check against the threshold and send the email if they fail
                if (calculatedAttendance < CRITICAL_THRESHOLD) {
                    sendDangerZoneAlert(
                            student.getEmail(),
                            student.getName(),
                            student.getCustomId(),
                            subject.getName(),
                            calculatedAttendance
                    );
                    emailsSent++;
                }
            }
        }

        return emailsSent;
    }


     // ------- 2. Sends a beautifully formatted HTML email alert to the student. --------
    public void sendDangerZoneAlert(String studentEmail, String studentName, String studentId, String subject, double currentAttendance) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(studentEmail);
            helper.setSubject("⚠️ URGENT: SALS Academic Alert - Action Required for " + subject);

            String htmlContent = buildHtmlTemplate(studentName, studentId, subject, currentAttendance);

            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("✅ Danger Zone alert successfully sent to " + studentEmail);

        } catch (MessagingException e) {
            System.err.println("❌ Failed to send Danger Zone email to " + studentEmail);
            e.printStackTrace();
        }
    }

    // ------- 3.  Constructs a professional, enterprise-grade HTML email template.
                // Uses Java 15+ Text Blocks (""") for clean HTML formatting.
    private String buildHtmlTemplate(String name, String id, String subject, double attendance) {
        long roundedAttendance = Math.round(attendance);

        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px; }
                    .container { max-w-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
                    .header { background-color: #0f172a; color: #ffffff; padding: 24px; text-align: center; }
                    .header h1 { margin: 0; font-size: 24px; letter-spacing: 1px; }
                    .warning-banner { background-color: #fef2f2; border-left: 6px solid #ef4444; padding: 16px 24px; margin: 24px; }
                    .warning-banner h2 { color: #b91c1c; margin-top: 0; font-size: 18px; }
                    .content { padding: 0 24px 24px 24px; color: #334155; line-height: 1.6; }
                    .stats-box { background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
                    .stat-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
                    .stat-row:last-child { border-bottom: none; }
                    .btn-container { text-align: center; margin-top: 32px; }
                    .btn { background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #94a3b8; background-color: #f8fafc; border-top: 1px solid #e2e8f0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>SALS ACADEMIC MONITORING</h1>
                    </div>
                    
                    <div class="warning-banner">
                        <h2>⚠️ Attendance Danger Zone Alert</h2>
                        <p style="margin-bottom:0; color:#7f1d1d;">Immediate action is required regarding your academic standing.</p>
                    </div>

                    <div class="content">
                        <p>Dear <strong>%s</strong> (ID: %s),</p>
                        <p>This is an automated notification from the Smart Attendance and Learning System. Our records indicate that your attendance for <strong>%s</strong> has dropped below the university's required threshold.</p>
                        
                        <div class="stats-box">
                            <div class="stat-row">
                                <strong>Required Threshold:</strong>
                                <span style="color:#0f172a; font-weight:bold;">%s%%</span>
                            </div>
                            <div class="stat-row">
                                <strong>Your Current Attendance:</strong>
                                <span style="color:#ef4444; font-weight:bold; font-size:18px;">%d%%</span>
                            </div>
                        </div>

                        <p>Falling below the required threshold may result in grade penalties or disqualification from final examinations. SALS is here to help you recover.</p>
                        
                        <div class="btn-container">
                            <a href="https://uptrackpath.vercel.app/studentDashboard" class="btn">Access Student Dashboard</a>
                        </div>
                        <p style="text-align:center; font-size:13px; margin-top:16px;">Log in to view upcoming makeup classes and generate your AI Recovery Roadmap.</p>
                    </div>

                    <div class="footer">
                        This is an automated message generated by the SALS Platform.<br>
                        Please do not reply directly to this email.
                    </div>
                </div>
            </body>
            </html>
            """.formatted(name, id, subject, CRITICAL_THRESHOLD, roundedAttendance);
    }
}
