package com.core_server.sals.service;

import com.core_server.sals.dto.StudentDashboardDTO;
import com.core_server.sals.entity.Attendance;
import com.core_server.sals.entity.Subject;
import com.core_server.sals.repository.AttendanceRepository;
import com.core_server.sals.repository.ClassSessionRepository;
import com.core_server.sals.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired private AttendanceRepository attendanceRepo;
    @Autowired private ClassSessionRepository sessionRepo;
    @Autowired private SubjectRepository subjectRepo;

    // ----- 1. Provides clean and neat Student Metrics(like: Subjects, Attendance Stats, Recent Activity, etc..) ----
    public StudentDashboardDTO getStudentStats(String studentId) {
        StudentDashboardDTO stats = new StudentDashboardDTO();

        List<Subject> subjects = subjectRepo.findAll();

        List<StudentDashboardDTO.SubjectStat> subjectStats = new ArrayList<>();
        int totalAttendedOverall = 0;
        int totalSessionsOverall = 0;
        int riskCount = 0;

        for (Subject sub : subjects) {
            // A. Calculate per subject
            int total = (int) sessionRepo.countValidSessionsBySubjectId(sub.getId());
            int attended = attendanceRepo.countByStudentIdAndSubjectId(studentId, sub.getId());

            double pct = total == 0 ? 0 : ((double) attended / total) * 100;

            StudentDashboardDTO.SubjectStat s = new StudentDashboardDTO.SubjectStat();
            s.subjectName = sub.getName();
            s.subjectCode = sub.getCode();
            s.attended = attended;
            s.total = total;
            s.percentage = pct;

            // B. Determine Status
            if (pct < 75) {
                s.status = "At Risk";
                s.color = "text-red-600";
                riskCount++;
            } else if (pct < 85) {
                s.status = "Moderate";
                s.color = "text-yellow-600";
            } else {
                s.status = "Good";
                s.color = "text-green-600";
            }

            subjectStats.add(s);

            totalAttendedOverall += attended;
            totalSessionsOverall += total;
        }

        // 2. Set Aggregates
        stats.subjectAttendance = subjectStats;
        stats.subjectsAtRisk = riskCount;
        stats.overallPercentage = totalSessionsOverall == 0 ? 0 :
                ((double) totalAttendedOverall / totalSessionsOverall) * 100;

        // 3. Classes This Week
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfWeek = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).withHour(0).withMinute(0);

        stats.classesThisWeek = sessionRepo.countSessionsBetween(startOfWeek, now);

        //  4. Recent Activity (Strictly TODAY, resets at 12:00 AM)
        LocalDateTime startOfDay = LocalDateTime.now().with(java.time.LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.now().with(java.time.LocalTime.MAX);

        List<Attendance> todaysLogs = attendanceRepo.findByStudentIdAndTimestampBetweenOrderByTimestampDesc(studentId, startOfDay, endOfDay);

        stats.recentActivity = new ArrayList<>();
        stats.makeupClassesToday = new ArrayList<>();

        for (Attendance log : todaysLogs) {
            StudentDashboardDTO.ActivityLog act = new StudentDashboardDTO.ActivityLog();
            act.subjectName = log.getSession() != null ? log.getSession().getSubject().getName() : "Unknown";
            act.status = "present";
            act.time = log.getTimestamp().toLocalTime().toString(); // Shows only time
            act.date = log.getTimestamp().toLocalDate().toString();

            if (log.getSession() != null && log.getSession().isMakeup()) {
                stats.makeupClassesToday.add(act);
            } else {
                stats.recentActivity.add(act);
            }
        }

        return stats;
    }
}