package com.hospital.repository;

import com.hospital.model.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    Optional<Prescription> findByAppointment_ApptId(Long apptId);
    boolean existsByAppointment_ApptId(Long apptId);
}
