package com.hospital.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateDoctorRequest {
    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    @NotNull(message = "Department ID is required")
    private Long deptId;

    @NotBlank(message = "Specialization is required")
    private String specialization;

    @NotNull(message = "Consultation fee is required")
    @DecimalMin(value = "0.00", message = "Fee cannot be negative")
    private BigDecimal fee;
}
