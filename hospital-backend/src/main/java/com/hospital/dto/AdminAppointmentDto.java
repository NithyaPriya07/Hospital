package com.hospital.dto;

import com.hospital.model.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAppointmentDto {
    private Long apptId;
    private Long patientId;
    private String patientName;
    private String patientEmail;
    private String patientPhone;
    private Long doctorId;
    private String doctorName;
    private String deptName;
    private LocalDate apptDate;
    private LocalTime apptTime;
    private Integer tokenNo;
    private AppointmentStatus status;
    private BigDecimal doctorFee;
}
