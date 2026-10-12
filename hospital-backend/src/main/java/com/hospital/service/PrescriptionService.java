package com.hospital.service;

import com.hospital.dto.PrescriptionRequest;
import com.hospital.dto.PrescriptionResponse;
import com.hospital.model.*;
import com.hospital.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import java.awt.Color;
import java.io.ByteArrayOutputStream;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final BillRepository billRepository;
    private final PatientRepository patientRepository;

    @Transactional
    public PrescriptionResponse createPrescription(String doctorUserEmail, PrescriptionRequest request) {
        User user = userRepository.findByEmail(doctorUserEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Doctor doctor = doctorRepository.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Authenticated user is not registered as a doctor"));

        Appointment appointment = appointmentRepository.findById(request.getApptId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found with ID: " + request.getApptId()));

        if (!appointment.getDoctor().getDoctorId().equals(doctor.getDoctorId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Doctor is not assigned to this appointment");
        }

        if (prescriptionRepository.existsByAppointment_ApptId(appointment.getApptId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Prescription already exists for this appointment");
        }

        // 1. Save Prescription
        Prescription prescription = Prescription.builder()
                .appointment(appointment)
                .diagnosis(request.getDiagnosis())
                .medicines(request.getMedicines())
                .notes(request.getNotes())
                .build();
        Prescription savedPrescription = prescriptionRepository.save(prescription);

        // 2. Mark Appointment COMPLETED
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);

        // 3. Automatically create a Bill from doctor's fee
        Bill bill = billRepository.findByAppointment_ApptId(appointment.getApptId())
                .orElseGet(() -> {
                    Bill newBill = Bill.builder()
                            .appointment(appointment)
                            .totalAmount(appointment.getDoctor().getFee())
                            .status(BillStatus.PENDING)
                            .build();
                    return billRepository.save(newBill);
                });

        return PrescriptionResponse.builder()
                .prescId(savedPrescription.getPrescId())
                .apptId(appointment.getApptId())
                .patientId(appointment.getPatient().getPatientId())
                .patientName(appointment.getPatient().getUser().getFullName())
                .doctorId(doctor.getDoctorId())
                .doctorName(doctor.getUser().getFullName())
                .departmentName(doctor.getDepartment().getDeptName())
                .apptDate(appointment.getApptDate())
                .diagnosis(savedPrescription.getDiagnosis())
                .medicines(savedPrescription.getMedicines())
                .notes(savedPrescription.getNotes())
                .billId(bill.getBillId())
                .billAmount(bill.getTotalAmount())
                .build();
    }

    public PrescriptionResponse getPrescriptionByAppointment(Long apptId) {
        Prescription prescription = prescriptionRepository.findByAppointment_ApptId(apptId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prescription not found for appointment ID: " + apptId));

        Appointment appt = prescription.getAppointment();
        Bill bill = billRepository.findByAppointment_ApptId(apptId).orElse(null);

        return PrescriptionResponse.builder()
                .prescId(prescription.getPrescId())
                .apptId(appt.getApptId())
                .patientId(appt.getPatient().getPatientId())
                .patientName(appt.getPatient().getUser().getFullName())
                .doctorId(appt.getDoctor().getDoctorId())
                .doctorName(appt.getDoctor().getUser().getFullName())
                .departmentName(appt.getDoctor().getDepartment().getDeptName())
                .apptDate(appt.getApptDate())
                .diagnosis(prescription.getDiagnosis())
                .medicines(prescription.getMedicines())
                .notes(prescription.getNotes())
                .billId(bill != null ? bill.getBillId() : null)
                .billAmount(bill != null ? bill.getTotalAmount() : null)
                .build();
    }

    public PrescriptionResponse getPrescriptionById(Long prescId) {
        Prescription prescription = prescriptionRepository.findById(prescId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prescription not found with ID: " + prescId));

        Appointment appt = prescription.getAppointment();
        Bill bill = billRepository.findByAppointment_ApptId(appt.getApptId()).orElse(null);

        return PrescriptionResponse.builder()
                .prescId(prescription.getPrescId())
                .apptId(appt.getApptId())
                .patientId(appt.getPatient().getPatientId())
                .patientName(appt.getPatient().getUser().getFullName())
                .doctorId(appt.getDoctor().getDoctorId())
                .doctorName(appt.getDoctor().getUser().getFullName())
                .departmentName(appt.getDoctor().getDepartment().getDeptName())
                .apptDate(appt.getApptDate())
                .diagnosis(prescription.getDiagnosis())
                .medicines(prescription.getMedicines())
                .notes(prescription.getNotes())
                .billId(bill != null ? bill.getBillId() : null)
                .billAmount(bill != null ? bill.getTotalAmount() : null)
                .build();
    }

    public byte[] generatePrescriptionPdf(Long prescId, String userEmail) {
        Prescription prescription = prescriptionRepository.findById(prescId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prescription not found with ID: " + prescId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Appointment appt = prescription.getAppointment();
        Patient patient = appt.getPatient();
        Doctor doctor = appt.getDoctor();

        // Security check: patients must own the prescription, doctors must be assigned to it
        if (user.getRole() == Role.PATIENT) {
            Patient currentPatient = patientRepository.findByUser(user)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Patient profile not found"));
            if (!patient.getPatientId().equals(currentPatient.getPatientId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to download this prescription");
            }
        } else if (user.getRole() == Role.DOCTOR) {
            Doctor currentDoctor = doctorRepository.findByUser(user)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Doctor profile not found"));
            if (!doctor.getDoctorId().equals(currentDoctor.getDoctorId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not assigned to this prescription");
            }
        }

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(document, out);
            document.open();

            // Color palette
            Color brandDark = new Color(15, 23, 42); // slate-900
            Color brandPrimary = new Color(2, 132, 199); // sky-600
            Color brandLight = new Color(248, 250, 252); // slate-50
            Color grayText = new Color(100, 116, 139); // slate-500
            Color borderGray = new Color(226, 232, 240); // slate-200

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, brandDark);
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, brandPrimary);
            Font smallGray = FontFactory.getFont(FontFactory.HELVETICA, 8, grayText);
            Font sectionTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, brandDark);
            Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, grayText);
            Font valFont = FontFactory.getFont(FontFactory.HELVETICA, 9, brandDark);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 9, brandDark);

            // 1. Hospital Header
            PdfPTable headerTable = new PdfPTable(1);
            headerTable.setWidthPercentage(100);

            PdfPCell hCell = new PdfPCell();
            hCell.setBorder(Rectangle.NO_BORDER);
            hCell.addElement(new Paragraph("CARESYNC MEDICAL CENTER", titleFont));
            hCell.addElement(new Paragraph("CLINICAL HEALTHCARE SERVICES & OUTPATIENT DEPARTMENT", subtitleFont));
            hCell.addElement(new Paragraph("100 Healthcare Parkway, Medical City | Helpline: +1 (800) 555-0199 | support@caresync.com", smallGray));
            headerTable.addCell(hCell);
            document.add(headerTable);

            // Divider line
            PdfPTable divider = new PdfPTable(1);
            divider.setWidthPercentage(100);
            divider.setSpacingBefore(8f);
            divider.setSpacingAfter(12f);
            PdfPCell dCell = new PdfPCell();
            dCell.setBackgroundColor(brandPrimary);
            dCell.setFixedHeight(2.5f);
            dCell.setBorder(Rectangle.NO_BORDER);
            divider.addCell(dCell);
            document.add(divider);

            // 2. Metadata: Patient Info & Doctor/Appointment Info
            PdfPTable metaTable = new PdfPTable(2);
            metaTable.setWidthPercentage(100);
            metaTable.setWidths(new float[]{1f, 1f});

            // Patient Card
            PdfPCell pCell = new PdfPCell();
            pCell.setBackgroundColor(brandLight);
            pCell.setBorderColor(borderGray);
            pCell.setPadding(10f);
            Paragraph pHeader = new Paragraph("PATIENT INFORMATION", labelFont);
            pHeader.setSpacingAfter(4f);
            pCell.addElement(pHeader);
            pCell.addElement(new Paragraph("Name: " + patient.getUser().getFullName(), valFont));
            pCell.addElement(new Paragraph("Email: " + patient.getUser().getEmail(), valFont));
            pCell.addElement(new Paragraph("Phone: " + (patient.getPhone() != null ? patient.getPhone() : "N/A"), valFont));
            pCell.addElement(new Paragraph("Gender: " + (patient.getGender() != null ? patient.getGender() : "N/A"), valFont));
            metaTable.addCell(pCell);

            // Doctor Card
            PdfPCell dInfoCell = new PdfPCell();
            dInfoCell.setBackgroundColor(brandLight);
            dInfoCell.setBorderColor(borderGray);
            dInfoCell.setPadding(10f);
            Paragraph dHeader = new Paragraph("CONSULTATION SUMMARY", labelFont);
            dHeader.setSpacingAfter(4f);
            dInfoCell.addElement(dHeader);
            dInfoCell.addElement(new Paragraph("Doctor: " + doctor.getUser().getFullName(), valFont));
            dInfoCell.addElement(new Paragraph("Department: " + doctor.getDepartment().getDeptName() + " (" + doctor.getSpecialization() + ")", valFont));
            dInfoCell.addElement(new Paragraph("Consultation Date: " + appt.getApptDate() + " at " + appt.getApptTime(), valFont));
            dInfoCell.addElement(new Paragraph("Queue Token: #" + appt.getTokenNo() + "  |  Prescription Ref: #" + prescription.getPrescId(), valFont));
            metaTable.addCell(dInfoCell);

            document.add(metaTable);

            // 3. Clinical Diagnosis
            Paragraph diagTitle = new Paragraph("CLINICAL DIAGNOSIS & FINDINGS", sectionTitleFont);
            diagTitle.setSpacingBefore(12f);
            diagTitle.setSpacingAfter(4f);
            document.add(diagTitle);

            PdfPTable diagTable = new PdfPTable(1);
            diagTable.setWidthPercentage(100);
            PdfPCell diagCell = new PdfPCell();
            diagCell.setBorderColor(borderGray);
            diagCell.setPadding(10f);
            diagCell.addElement(new Paragraph(prescription.getDiagnosis() != null ? prescription.getDiagnosis() : "No formal diagnosis notes recorded.", bodyFont));
            diagTable.addCell(diagCell);
            document.add(diagTable);

            // 4. Prescribed Medications
            Paragraph medTitle = new Paragraph("Rx  PRESCRIBED MEDICINES & DOSAGE SCHEDULE", sectionTitleFont);
            medTitle.setSpacingBefore(12f);
            medTitle.setSpacingAfter(4f);
            document.add(medTitle);

            PdfPTable medTable = new PdfPTable(1);
            medTable.setWidthPercentage(100);
            PdfPCell medCell = new PdfPCell();
            medCell.setBorderColor(borderGray);
            medCell.setBackgroundColor(brandLight);
            medCell.setPadding(10f);
            medCell.addElement(new Paragraph(prescription.getMedicines() != null ? prescription.getMedicines() : "No medication prescribed.", bodyFont));
            medTable.addCell(medCell);
            document.add(medTable);

            // 5. Clinical Advice / Doctor's Notes
            if (prescription.getNotes() != null && !prescription.getNotes().trim().isEmpty()) {
                Paragraph notesTitle = new Paragraph("DOCTOR'S CLINICAL ADVICE & INSTRUCTIONS", sectionTitleFont);
                notesTitle.setSpacingBefore(12f);
                notesTitle.setSpacingAfter(4f);
                document.add(notesTitle);

                PdfPTable notesTable = new PdfPTable(1);
                notesTable.setWidthPercentage(100);
                PdfPCell notesCell = new PdfPCell();
                notesCell.setBorderColor(borderGray);
                notesCell.setPadding(10f);
                notesCell.addElement(new Paragraph(prescription.getNotes(), bodyFont));
                notesTable.addCell(notesCell);
                document.add(notesTable);
            }

            // 6. Signature Block
            PdfPTable signTable = new PdfPTable(1);
            signTable.setWidthPercentage(100);
            signTable.setSpacingBefore(20f);

            PdfPCell sCell = new PdfPCell();
            sCell.setBorder(Rectangle.NO_BORDER);
            sCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph signLine = new Paragraph("____________________________________", labelFont);
            signLine.setAlignment(Element.ALIGN_RIGHT);
            Paragraph doctorNamePara = new Paragraph(doctor.getUser().getFullName(), valFont);
            doctorNamePara.setAlignment(Element.ALIGN_RIGHT);
            Paragraph doctorSpecPara = new Paragraph(doctor.getSpecialization() + " - " + doctor.getDepartment().getDeptName(), smallGray);
            doctorSpecPara.setAlignment(Element.ALIGN_RIGHT);
            Paragraph authPara = new Paragraph("Authorized Medical Practitioner (Digitally Verified)", smallGray);
            authPara.setAlignment(Element.ALIGN_RIGHT);

            sCell.addElement(signLine);
            sCell.addElement(doctorNamePara);
            sCell.addElement(doctorSpecPara);
            sCell.addElement(authPara);
            signTable.addCell(sCell);
            document.add(signTable);

            // 7. Footer
            Paragraph footer = new Paragraph("This is an official computer-generated medical prescription issued by CareSync Hospital Management Portal.", smallGray);
            footer.setSpacingBefore(16f);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return out.toByteArray();
        } catch (ResponseStatusException rse) {
            throw rse;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate prescription PDF: " + e.getMessage());
        }
    }
}
