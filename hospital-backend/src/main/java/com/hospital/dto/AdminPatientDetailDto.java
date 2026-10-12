package com.hospital.dto;

import com.hospital.model.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPatientDetailDto {
    private Long patientId;
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String gender;
    private LocalDate dob;
    private String address;
    private long totalAppointments;
    private BigDecimal totalAmountPaid;
    private List<PatientAppointmentItem> appointments;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PatientAppointmentItem {
        private Long apptId;
        private String doctorName;
        private String departmentName;
        private LocalDate apptDate;
        private LocalTime apptTime;
        private Integer tokenNo;
        private AppointmentStatus status;
        private BigDecimal fee;
    }
}
