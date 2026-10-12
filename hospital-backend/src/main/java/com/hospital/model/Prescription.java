package com.hospital.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "prescriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "presc_id")
    private Long prescId;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "appt_id", nullable = false, unique = true)
    private Appointment appointment;

    @Column(name = "diagnosis", columnDefinition = "TEXT")
    private String diagnosis;

    @Column(name = "medicines", columnDefinition = "TEXT")
    private String medicines;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
