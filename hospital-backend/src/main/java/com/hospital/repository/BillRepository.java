package com.hospital.repository;

import com.hospital.model.Bill;
import com.hospital.model.BillStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    Optional<Bill> findByAppointment_ApptId(Long apptId);
    List<Bill> findByAppointment_Patient_PatientIdOrderByBillIdDesc(Long patientId);
    List<Bill> findByAppointment_Doctor_DoctorId(Long doctorId);
    List<Bill> findByStatus(BillStatus status);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Bill b WHERE b.status = com.hospital.model.BillStatus.PAID")
    BigDecimal sumPaidBills();
}
