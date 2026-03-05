package com.core_server.sals.dto;


import java.util.List;

public class StudentDashboardDTO {
    public double overallPercentage;
    public int classesThisWeek;
    public int subjectsAtRisk;
    public int currentStreak;

    public List<SubjectStat> subjectAttendance;
    public List<ActivityLog> recentActivity;

    public List<ActivityLog> makeupClassesToday;

    public static class SubjectStat {
        public String subjectName;
        public String subjectCode;
        public int attended;
        public int total;
        public double percentage;
        public String status;
        public String color;
    }

    public static class ActivityLog {
        public String subjectName;
        public String date;     // "Thu, 26 Feb"
        public String time;     // "09:14 AM"
        public String status;   // "present" or "absent"
    }
}