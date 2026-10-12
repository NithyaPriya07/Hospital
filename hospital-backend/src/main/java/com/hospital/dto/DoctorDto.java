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
public class DoctorDto {
    private Long doctorId;
    private Long userId;
    private String fullName;
    private String email;
    private Long deptId;
    private String deptName;
    private String specialization;
    private BigDecimal fee;
}
