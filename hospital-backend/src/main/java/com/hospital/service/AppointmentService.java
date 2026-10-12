package com.hospital.service;

import com.hospital.dto.AppointmentRequest;
import com.hospital.dto.AppointmentResponse;
import com.hospital.model.*;
import com.hospital.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final BillRepository billRepository;

    @Transactional
    public AppointmentResponse bookAppointment(String patientUserEmail, AppointmentRequest request) {
        User user = userRepository.findByEmail(patientUserEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Patient patient = patientRepository.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User does not have an active patient profile"));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found with ID: " + request.getDoctorId()));

        // Check if slot is already booked
        boolean slotBooked = appointmentRepository.existsByDoctor_DoctorIdAndApptDateAndApptTime(
                request.getDoctorId(),
                request.getApptDate(),
                request.getApptTime()
        );

        if (slotBooked) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Doctor already has an appointment booked at " + request.getApptDate() + " " + request.getApptTime());
        }

        // Generate sequential token number SCOPED to this specific doctor and this specific date (excluding CANCELLED)
        int activeCount = appointmentRepository.countActiveAppointmentsByDoctorAndDate(request.getDoctorId(), request.getApptDate());
        int nextToken = activeCount + 1;

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .apptDate(request.getApptDate())
                .apptTime(request.getApptTime())
                .tokenNo(nextToken)
                .status(AppointmentStatus.BOOKED)
                .build();

        Appointment saved = appointmentRepository.save(appointment);
        return mapToResponse(saved);
    }

    public List<AppointmentResponse> getTodayDoctorAppointments(String doctorUserEmail) {
        User user = userRepository.findByEmail(doctorUserEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Doctor doctor = doctorRepository.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Authenticated user is not registered as a doctor"));

        LocalDate today = LocalDate.now();
        // Sorted by appt_time ascending to match queue arrival sequence through the day
        List<Appointment> appointments = appointmentRepository.findByDoctor_DoctorIdAndApptDateOrderByApptTimeAscTokenNoAsc(
                doctor.getDoctorId(),
                today
        );

        return appointments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AppointmentResponse> getPatientAppointments(String patientUserEmail) {
        User user = userRepository.findByEmail(patientUserEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Patient patient = patientRepository.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient profile not found"));

        return appointmentRepository.findByPatient_PatientIdOrderByApptDateDescApptTimeAsc(patient.getPatientId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AppointmentResponse cancelAppointment(Long appointmentId, String patientUserEmail) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found with ID: " + appointmentId));

        User user = userRepository.findByEmail(patientUserEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Patient patient = patientRepository.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient profile not found"));

        if (!appointment.getPatient().getPatientId().equals(patient.getPatientId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to cancel this appointment");
        }

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot cancel an appointment that is already COMPLETED");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        Appointment updated = appointmentRepository.save(appointment);

        return mapToResponse(updated);
    }

    public List<String> getBookedSlots(Long doctorId, LocalDate apptDate) {
        List<java.time.LocalTime> times = appointmentRepository.findBookedTimesByDoctorAndDate(doctorId, apptDate);
        return times.stream()
                .map(t -> String.format("%02d:%02d:%02d", t.getHour(), t.getMinute(), t.getSecond()))
                .collect(Collectors.toList());
    }

    public AppointmentResponse mapToResponse(Appointment appointment) {
        boolean hasPrescription = prescriptionRepository.existsByAppointment_ApptId(appointment.getApptId());
        Optional<Bill> billOpt = billRepository.findByAppointment_ApptId(appointment.getApptId());

        return AppointmentResponse.builder()
                .apptId(appointment.getApptId())
                .patientId(appointment.getPatient().getPatientId())
                .patientName(appointment.getPatient().getUser().getFullName())
                .patientPhone(appointment.getPatient().getPhone())
                .doctorId(appointment.getDoctor().getDoctorId())
                .doctorName(appointment.getDoctor().getUser().getFullName())
                .departmentName(appointment.getDoctor().getDepartment().getDeptName())
                .apptDate(appointment.getApptDate())
                .apptTime(appointment.getApptTime())
                .tokenNo(appointment.getTokenNo())
                .status(appointment.getStatus())
                .doctorFee(appointment.getDoctor().getFee())
                .hasPrescription(hasPrescription)
                .billId(billOpt.map(Bill::getBillId).orElse(null))
                .billStatus(billOpt.map(Bill::getStatus).orElse(null))
                .build();
    }
}
