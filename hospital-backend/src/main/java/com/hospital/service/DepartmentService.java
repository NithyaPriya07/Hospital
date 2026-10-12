package com.hospital.service;

import com.hospital.dto.CreateDepartmentRequest;
import com.hospital.dto.DepartmentDto;
import com.hospital.model.Department;
import com.hospital.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(d -> DepartmentDto.builder()
                        .deptId(d.getDeptId())
                        .deptName(d.getDeptName())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public DepartmentDto createDepartment(CreateDepartmentRequest request) {
        if (departmentRepository.existsByDeptName(request.getDeptName().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Department already exists: " + request.getDeptName());
        }

        Department department = Department.builder()
                .deptName(request.getDeptName().trim())
                .build();

        Department saved = departmentRepository.save(department);

        return DepartmentDto.builder()
                .deptId(saved.getDeptId())
                .deptName(saved.getDeptName())
                .build();
    }
}
