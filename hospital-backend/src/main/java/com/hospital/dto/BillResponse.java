package com.hospital.dto;

import com.hospital.model.BillStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillResponse {
    private Long billId;
    private Long apptId;
    private Long patientId;
    private String patientName;
    private String doctorName;
    private String departmentName;
    private LocalDate apptDate;
    private BigDecimal totalAmount;
    private BillStatus status;
    private List<PaymentItemDto> payments;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentItemDto {
        private Long paymentId;
        private String method;
        private BigDecimal amount;
        private LocalDateTime paymentDate;
    }
}
