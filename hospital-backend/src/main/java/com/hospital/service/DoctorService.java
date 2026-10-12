package com.hospital.service;

import com.hospital.dto.CreateDoctorRequest;
import com.hospital.dto.DoctorDto;
import com.hospital.model.Department;
import com.hospital.model.Doctor;
import com.hospital.model.Role;
import com.hospital.model.User;
import com.hospital.repository.DepartmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<DoctorDto> getDoctors(Long deptId) {
        List<Doctor> doctors;
        if (deptId != null) {
            doctors = doctorRepository.findByDepartment_DeptId(deptId);
        } else {
            doctors = doctorRepository.findAll();
        }

        return doctors.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public DoctorDto getDoctorById(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found with ID: " + doctorId));
        return mapToDto(doctor);
    }

    @Transactional
    public DoctorDto createDoctor(CreateDoctorRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User email already exists: " + request.getEmail());
        }

        Department department = departmentRepository.findById(request.getDeptId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Department not found with ID: " + request.getDeptId()));

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.DOCTOR)
                .build();
        User savedUser = userRepository.save(user);

        Doctor doctor = Doctor.builder()
                .user(savedUser)
                .department(department)
                .specialization(request.getSpecialization())
                .fee(request.getFee())
                .build();
        Doctor savedDoctor = doctorRepository.save(doctor);

        return mapToDto(savedDoctor);
    }

    public DoctorDto mapToDto(Doctor doctor) {
        return DoctorDto.builder()
                .doctorId(doctor.getDoctorId())
                .userId(doctor.getUser().getUserId())
                .fullName(doctor.getUser().getFullName())
                .email(doctor.getUser().getEmail())
                .deptId(doctor.getDepartment().getDeptId())
                .deptName(doctor.getDepartment().getDeptName())
                .specialization(doctor.getSpecialization())
                .fee(doctor.getFee())
                .build();
    }
}
