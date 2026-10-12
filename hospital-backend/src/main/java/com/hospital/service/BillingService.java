package com.hospital.service;

import com.hospital.dto.BillResponse;
import com.hospital.dto.PaymentRequest;
import com.hospital.model.*;
import com.hospital.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final BillRepository billRepository;
    private final PaymentRepository paymentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public List<BillResponse> getPatientBills(String patientUserEmail) {
        User user = userRepository.findByEmail(patientUserEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Patient patient = patientRepository.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient profile not found"));

        List<Bill> bills = billRepository.findByAppointment_Patient_PatientIdOrderByBillIdDesc(patient.getPatientId());
        return bills.stream()
                .map(this::mapToBillResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BillResponse recordPayment(String patientUserEmail, PaymentRequest request) {
        User user = userRepository.findByEmail(patientUserEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Patient patient = patientRepository.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient profile not found"));

        Bill bill = billRepository.findById(request.getBillId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bill not found with ID: " + request.getBillId()));

        if (!bill.getAppointment().getPatient().getPatientId().equals(patient.getPatientId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this bill");
        }

        if (bill.getStatus() == BillStatus.PAID) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This bill has already been PAID");
        }

        // 1. Create and save Payment record
        Payment payment = Payment.builder()
                .bill(bill)
                .method(request.getMethod())
                .amount(request.getAmount())
                .build();
        paymentRepository.save(payment);

        // 2. Mark the bill PAID
        bill.setStatus(BillStatus.PAID);
        Bill updatedBill = billRepository.save(bill);

        return mapToBillResponse(updatedBill);
    }

    public BillResponse mapToBillResponse(Bill bill) {
        List<Payment> payments = paymentRepository.findByBill_BillId(bill.getBillId());
        List<BillResponse.PaymentItemDto> paymentDtos = payments.stream()
                .map(p -> BillResponse.PaymentItemDto.builder()
                        .paymentId(p.getPaymentId())
                        .method(p.getMethod())
                        .amount(p.getAmount())
                        .paymentDate(p.getPaymentDate())
                        .build())
                .collect(Collectors.toList());

        Appointment appt = bill.getAppointment();

        return BillResponse.builder()
                .billId(bill.getBillId())
                .apptId(appt.getApptId())
                .patientId(appt.getPatient().getPatientId())
                .patientName(appt.getPatient().getUser().getFullName())
                .doctorName(appt.getDoctor().getUser().getFullName())
                .departmentName(appt.getDoctor().getDepartment().getDeptName())
                .apptDate(appt.getApptDate())
                .totalAmount(bill.getTotalAmount())
                .status(bill.getStatus())
                .payments(paymentDtos)
                .build();
    }
}
