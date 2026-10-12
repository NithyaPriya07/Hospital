package com.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDoctorDetailDto {
    private Long doctorId;
    private Long userId;
    private String fullName;
    private String email;
    private String departmentName;
    private String specialization;
    private BigDecimal fee;
    private long totalAppointments;
    private long completedAppointments;
    private BigDecimal totalRevenue;
}
