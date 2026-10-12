package com.hospital.repository;

import com.hospital.model.Doctor;
import com.hospital.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    List<Doctor> findByDepartment_DeptId(Long deptId);
    Optional<Doctor> findByUser(User user);
    Optional<Doctor> findByUser_UserId(Long userId);
}
