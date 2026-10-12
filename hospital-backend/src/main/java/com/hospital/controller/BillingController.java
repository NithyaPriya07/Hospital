package com.hospital.controller;

import com.hospital.dto.BillResponse;
import com.hospital.dto.PaymentRequest;
import com.hospital.service.BillingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;

    @GetMapping("/api/bills/patient")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<BillResponse>> getPatientBills(Authentication authentication) {
        return ResponseEntity.ok(billingService.getPatientBills(authentication.getName()));
    }

    @PostMapping("/api/payments")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<BillResponse> recordPayment(
            Authentication authentication,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(billingService.recordPayment(authentication.getName(), request));
    }
}
