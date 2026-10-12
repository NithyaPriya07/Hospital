package com.hospital.controller;

import com.hospital.dto.PrescriptionRequest;
import com.hospital.dto.PrescriptionResponse;
import com.hospital.service.PrescriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<PrescriptionResponse> createPrescription(
            Authentication authentication,
            @Valid @RequestBody PrescriptionRequest request) {
        PrescriptionResponse response = prescriptionService.createPrescription(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/appointment/{apptId}")
    public ResponseEntity<PrescriptionResponse> getPrescriptionByAppointment(@PathVariable("apptId") Long apptId) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionByAppointment(apptId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<PrescriptionResponse> getPrescriptionById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionById(id));
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<byte[]> downloadPrescriptionPdf(
            @PathVariable("id") Long id,
            Authentication authentication) {
        byte[] pdfBytes = prescriptionService.generatePrescriptionPdf(id, authentication.getName());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.builder("attachment")
                .filename("Prescription-" + id + ".pdf")
                .build());

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    @GetMapping("/appointment/{apptId}/pdf")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<byte[]> downloadPrescriptionPdfByAppt(
            @PathVariable("apptId") Long apptId,
            Authentication authentication) {
        PrescriptionResponse presc = prescriptionService.getPrescriptionByAppointment(apptId);
        return downloadPrescriptionPdf(presc.getPrescId(), authentication);
    }
}
