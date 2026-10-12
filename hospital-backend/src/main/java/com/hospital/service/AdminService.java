package com.hospital.service;

import com.hospital.dto.*;
import com.hospital.model.*;
import com.hospital.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final DoctorService doctorService;
    private final DepartmentService departmentService;
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final BillRepository billRepository;

    public DoctorDto createDoctor(CreateDoctorRequest request) {
        return doctorService.createDoctor(request);
    }

    public DepartmentDto createDepartment(CreateDepartmentRequest request) {
        return departmentService.createDepartment(request);
    }

    public List<AdminAppointmentDto> getAllAppointments() {
        List<Appointment> appointments = appointmentRepository.findAllByOrderByApptDateDescApptTimeDesc();
        return appointments.stream().map(a -> AdminAppointmentDto.builder()
                .apptId(a.getApptId())
                .patientId(a.getPatient().getPatientId())
                .patientName(a.getPatient().getUser().getFullName())
                .patientEmail(a.getPatient().getUser().getEmail())
                .patientPhone(a.getPatient().getPhone())
                .doctorId(a.getDoctor().getDoctorId())
                .doctorName(a.getDoctor().getUser().getFullName())
                .deptName(a.getDoctor().getDepartment().getDeptName())
                .apptDate(a.getApptDate())
                .apptTime(a.getApptTime())
                .tokenNo(a.getTokenNo())
                .status(a.getStatus())
                .doctorFee(a.getDoctor().getFee())
                .build()
        ).collect(Collectors.toList());
    }

    public List<AdminDoctorDetailDto> getAllDoctorDetails() {
        List<Doctor> doctors = doctorRepository.findAll();
        return doctors.stream().map(d -> {
            List<Appointment> docAppts = appointmentRepository.findByDoctor_DoctorId(d.getDoctorId());
            long totalAppts = docAppts.size();
            long completedAppts = docAppts.stream()
                    .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                    .count();

            List<Bill> docBills = billRepository.findByAppointment_Doctor_DoctorId(d.getDoctorId());
            BigDecimal totalRevenue = docBills.stream()
                    .filter(b -> b.getStatus() == BillStatus.PAID)
                    .map(Bill::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            return AdminDoctorDetailDto.builder()
                    .doctorId(d.getDoctorId())
                    .userId(d.getUser().getUserId())
                    .fullName(d.getUser().getFullName())
                    .email(d.getUser().getEmail())
                    .departmentName(d.getDepartment().getDeptName())
                    .specialization(d.getSpecialization())
                    .fee(d.getFee())
                    .totalAppointments(totalAppts)
                    .completedAppointments(completedAppts)
                    .totalRevenue(totalRevenue)
                    .build();
        }).collect(Collectors.toList());
    }

    public List<AdminPatientDetailDto> getAllPatientDetails() {
        List<Patient> patients = patientRepository.findAll();
        return patients.stream().map(p -> {
            List<Appointment> patientAppts = appointmentRepository.findByPatient_PatientId(p.getPatientId());
            long totalAppts = patientAppts.size();

            List<Bill> patientBills = billRepository.findByAppointment_Patient_PatientIdOrderByBillIdDesc(p.getPatientId());
            BigDecimal totalPaid = patientBills.stream()
                    .filter(b -> b.getStatus() == BillStatus.PAID)
                    .map(Bill::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            List<AdminPatientDetailDto.PatientAppointmentItem> history = patientAppts.stream()
                    .sorted((a1, a2) -> {
                        int dateComp = a2.getApptDate().compareTo(a1.getApptDate());
                        if (dateComp != 0) return dateComp;
                        return a2.getApptTime().compareTo(a1.getApptTime());
                    })
                    .map(a -> AdminPatientDetailDto.PatientAppointmentItem.builder()
                            .apptId(a.getApptId())
                            .doctorName(a.getDoctor().getUser().getFullName())
                            .departmentName(a.getDoctor().getDepartment().getDeptName())
                            .apptDate(a.getApptDate())
                            .apptTime(a.getApptTime())
                            .tokenNo(a.getTokenNo())
                            .status(a.getStatus())
                            .fee(a.getDoctor().getFee())
                            .build()
                    ).collect(Collectors.toList());

            return AdminPatientDetailDto.builder()
                    .patientId(p.getPatientId())
                    .userId(p.getUser().getUserId())
                    .fullName(p.getUser().getFullName())
                    .email(p.getUser().getEmail())
                    .phone(p.getPhone())
                    .gender(p.getGender())
                    .dob(p.getDob())
                    .address(p.getAddress())
                    .totalAppointments(totalAppts)
                    .totalAmountPaid(totalPaid)
                    .appointments(history)
                    .build();
        }).collect(Collectors.toList());
    }

    public AdminReportsResponse getReports() {
        BigDecimal totalRevenue = billRepository.sumPaidBills();
        long totalAppointments = appointmentRepository.count();
        long totalPatients = patientRepository.count();
        long totalDoctors = doctorRepository.count();

        // 1. Appointments per day
        List<Object[]> rawApptsPerDay = appointmentRepository.countAppointmentsPerDay();
        List<AdminReportsResponse.DailyAppointmentCount> dailyList = new ArrayList<>();
        for (Object[] row : rawApptsPerDay) {
            String dateStr = row[0] instanceof LocalDate ? ((LocalDate) row[0]).toString() : String.valueOf(row[0]);
            Long count = ((Number) row[1]).longValue();
            dailyList.add(new AdminReportsResponse.DailyAppointmentCount(dateStr, count));
        }

        // 2. Patients per doctor
        List<Object[]> rawPatientsPerDoctor = appointmentRepository.countPatientsPerDoctor();
        List<AdminReportsResponse.DoctorPatientCount> doctorPatientList = new ArrayList<>();
        for (Object[] row : rawPatientsPerDoctor) {
            String doctorName = String.valueOf(row[0]);
            Long count = ((Number) row[1]).longValue();
            doctorPatientList.add(new AdminReportsResponse.DoctorPatientCount(doctorName, count));
        }

        return AdminReportsResponse.builder()
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .totalAppointments(totalAppointments)
                .totalPatients(totalPatients)
                .totalDoctors(totalDoctors)
                .appointmentsPerDay(dailyList)
                .patientsPerDoctor(doctorPatientList)
                .build();
    }
}
