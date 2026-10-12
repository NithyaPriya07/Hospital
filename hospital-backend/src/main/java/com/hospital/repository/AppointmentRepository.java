package com.hospital.repository;

import com.hospital.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    boolean existsByDoctor_DoctorIdAndApptDateAndApptTime(Long doctorId, LocalDate apptDate, LocalTime apptTime);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor.doctorId = :doctorId AND a.apptDate = :apptDate AND a.status != com.hospital.model.AppointmentStatus.CANCELLED")
    int countActiveAppointmentsByDoctorAndDate(@Param("doctorId") Long doctorId, @Param("apptDate") LocalDate apptDate);

    List<Appointment> findByDoctor_DoctorIdAndApptDateOrderByApptTimeAscTokenNoAsc(Long doctorId, LocalDate apptDate);

    List<Appointment> findByPatient_PatientIdOrderByApptDateDescApptTimeAsc(Long patientId);

    List<Appointment> findAllByOrderByApptDateDescApptTimeDesc();

    List<Appointment> findByDoctor_DoctorId(Long doctorId);

    List<Appointment> findByPatient_PatientId(Long patientId);

    @Query("SELECT a.apptDate, COUNT(a) FROM Appointment a GROUP BY a.apptDate ORDER BY a.apptDate DESC")
    List<Object[]> countAppointmentsPerDay();

    @Query("SELECT a.doctor.user.fullName, COUNT(DISTINCT a.patient.patientId) FROM Appointment a GROUP BY a.doctor.user.fullName")
    List<Object[]> countPatientsPerDoctor();

    @Query("SELECT a.apptTime FROM Appointment a WHERE a.doctor.doctorId = :doctorId AND a.apptDate = :apptDate AND a.status != com.hospital.model.AppointmentStatus.CANCELLED")
    List<LocalTime> findBookedTimesByDoctorAndDate(@Param("doctorId") Long doctorId, @Param("apptDate") LocalDate apptDate);
}
