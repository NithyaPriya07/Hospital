package com.hospital.controller;

import com.hospital.dto.*;
import com.hospital.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/doctors")
    public ResponseEntity<DoctorDto> createDoctor(@Valid @RequestBody CreateDoctorRequest request) {
        DoctorDto response = adminService.createDoctor(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/departments")
    public ResponseEntity<DepartmentDto> createDepartment(@Valid @RequestBody CreateDepartmentRequest request) {
        DepartmentDto response = adminService.createDepartment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/reports")
    public ResponseEntity<AdminReportsResponse> getReports() {
        return ResponseEntity.ok(adminService.getReports());
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<AdminAppointmentDto>> getAllAppointments() {
        return ResponseEntity.ok(adminService.getAllAppointments());
    }

    @GetMapping("/doctors/details")
    public ResponseEntity<List<AdminDoctorDetailDto>> getAllDoctorDetails() {
        return ResponseEntity.ok(adminService.getAllDoctorDetails());
    }

    @GetMapping("/patients/details")
    public ResponseEntity<List<AdminPatientDetailDto>> getAllPatientDetails() {
        return ResponseEntity.ok(adminService.getAllPatientDetails());
    }
}
