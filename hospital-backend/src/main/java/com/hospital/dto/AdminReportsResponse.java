package com.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminReportsResponse {
    private BigDecimal totalRevenue;
    private long totalAppointments;
    private long totalPatients;
    private long totalDoctors;
    private List<DailyAppointmentCount> appointmentsPerDay;
    private List<DoctorPatientCount> patientsPerDoctor;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DailyAppointmentCount {
        private String date;
        private Long count;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DoctorPatientCount {
        private String doctorName;
        private Long patientCount;
    }
}
