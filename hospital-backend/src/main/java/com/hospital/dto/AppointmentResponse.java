package com.hospital.dto;

import com.hospital.model.AppointmentStatus;
import com.hospital.model.BillStatus;
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
public class AppointmentResponse {
    private Long apptId;
    private Long patientId;
    private String patientName;
    private String patientPhone;
    private Long doctorId;
    private String doctorName;
    private String departmentName;
    private LocalDate apptDate;
    private LocalTime apptTime;
    private Integer tokenNo;
    private AppointmentStatus status;
    private BigDecimal doctorFee;
    private Boolean hasPrescription;
    private Long billId;
    private BillStatus billStatus;
}
