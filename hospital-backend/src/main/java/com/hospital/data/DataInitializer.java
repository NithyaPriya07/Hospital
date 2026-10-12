package com.hospital.data;

import com.hospital.model.*;
import com.hospital.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedDepartmentsAndDoctors();
        printStartupSummary();
    }

    private void seedAdmin() {
        if (!userRepository.existsByEmail("admin@hospital.com")) {
            User admin = User.builder()
                    .fullName("Hospital Administrator")
                    .email("admin@hospital.com")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            log.info(">>> Seeded default ADMIN account: admin@hospital.com / admin123");
        }
    }

    private void seedDepartmentsAndDoctors() {
        // Department 1: Cardiology
        Department cardiology = departmentRepository.findByDeptName("Cardiology")
                .orElseGet(() -> departmentRepository.save(Department.builder().deptName("Cardiology").build()));

        // Department 2: Neurology
        Department neurology = departmentRepository.findByDeptName("Neurology")
                .orElseGet(() -> departmentRepository.save(Department.builder().deptName("Neurology").build()));

        // Department 3: Pediatrics
        Department pediatrics = departmentRepository.findByDeptName("Pediatrics")
                .orElseGet(() -> departmentRepository.save(Department.builder().deptName("Pediatrics").build()));

        // Department 4: Orthopedics
        Department orthopedics = departmentRepository.findByDeptName("Orthopedics")
                .orElseGet(() -> departmentRepository.save(Department.builder().deptName("Orthopedics").build()));

        // Department 5: General Medicine
        Department general = departmentRepository.findByDeptName("General Medicine")
                .orElseGet(() -> departmentRepository.save(Department.builder().deptName("General Medicine").build()));

        // Exactly ONE doctor per department
        seedDoctor("doctor.sarah@hospital.com", "Dr. Sarah Jenkins", "doctor123", cardiology, "Interventional Cardiology", new BigDecimal("75.00"));
        seedDoctor("doctor.marcus@hospital.com", "Dr. Marcus Vance", "doctor123", neurology, "Clinical Neurophysiology", new BigDecimal("90.00"));
        seedDoctor("doctor.emily@hospital.com", "Dr. Emily Chen", "doctor123", pediatrics, "Pediatric Care & Neonatology", new BigDecimal("60.00"));
        seedDoctor("doctor.david@hospital.com", "Dr. David Miller", "doctor123", orthopedics, "Orthopedic Surgery & Joint Care", new BigDecimal("80.00"));
        seedDoctor("doctor.james@hospital.com", "Dr. James Wilson", "doctor123", general, "Internal Medicine & Primary Care", new BigDecimal("50.00"));
    }

    private void seedDoctor(String email, String fullName, String password, Department dept, String specialization, BigDecimal fee) {
        if (!userRepository.existsByEmail(email)) {
            User docUser = userRepository.save(User.builder()
                    .fullName(fullName)
                    .email(email)
                    .passwordHash(passwordEncoder.encode(password))
                    .role(Role.DOCTOR)
                    .build());

            doctorRepository.save(Doctor.builder()
                    .user(docUser)
                    .department(dept)
                    .specialization(specialization)
                    .fee(fee)
                    .build());
            log.info(">>> Seeded DOCTOR account: {} ({})", email, fullName);
        }
    }

    private void printStartupSummary() {
        log.info("======================================================================");
        log.info("CARE-SYNC SEEDED SYSTEM CREDENTIALS");
        log.info("======================================================================");
        log.info("ADMIN ACCOUNT:");
        log.info("  Email: admin@hospital.com  |  Password: admin123");
        log.info("----------------------------------------------------------------------");
        log.info("DOCTOR ACCOUNTS (1 per department):");
        log.info("  1. Dr. Sarah Jenkins (Cardiology)      : doctor.sarah@hospital.com / doctor123");
        log.info("  2. Dr. Marcus Vance  (Neurology)       : doctor.marcus@hospital.com / doctor123");
        log.info("  3. Dr. Emily Chen    (Pediatrics)      : doctor.emily@hospital.com / doctor123");
        log.info("  4. Dr. David Miller  (Orthopedics)     : doctor.david@hospital.com / doctor123");
        log.info("  5. Dr. James Wilson  (General Medicine): doctor.james@hospital.com / doctor123");
        log.info("----------------------------------------------------------------------");
        log.info("PATIENT ACCOUNTS: None seeded (patients self-register via /register)");
        log.info("======================================================================");
    }
}
