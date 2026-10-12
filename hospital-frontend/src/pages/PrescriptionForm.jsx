import React, { useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { 
  FileText, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Pill, 
  Stethoscope, 
  User, 
  CreditCard 
} from 'lucide-react';

const PrescriptionForm = () => {
  const { apptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const appointment = location.state?.appointment;

  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/prescriptions', {
        apptId: Number(apptId),
        diagnosis,
        medicines,
        notes,
      });

      setSuccessResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit prescription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/doctor/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Queue
          </Link>
        </div>

        {successResult ? (
          /* Success Screen */
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Prescription Recorded & Bill Generated!
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Appointment #{apptId} is marked as <strong>COMPLETED</strong>. An invoice of ${Number(successResult.billAmount || 0).toFixed(2)} has been automatically issued to the patient.
            </p>

            <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Patient</span>
                <span className="font-bold text-slate-900">{successResult.patientName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Generated Bill ID</span>
                <span className="font-bold text-slate-900">#{successResult.billId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Fee Charged</span>
                <span className="font-bold text-emerald-700 font-mono">${Number(successResult.billAmount || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => navigate('/doctor/dashboard')}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all"
              >
                Return to Today's Queue
              </button>
            </div>
          </div>
        ) : (
          /* Prescription Form */
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200">
            
            <div className="border-b border-slate-100 pb-6 mb-6">
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-700 block mb-1">
                Consultation Record
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Write Medical Prescription
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Completing this form will mark the appointment as COMPLETED and automatically issue a bill to the patient.
              </p>
            </div>

            {/* Appointment Context Banner */}
            {appointment && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-200/60 text-emerald-800 flex items-center justify-center font-extrabold text-sm">
                    #{appointment.tokenNo}
                  </div>
                  <div>
                    <span className="text-xs text-emerald-700 font-bold block uppercase tracking-wide">Patient</span>
                    <span className="text-sm font-extrabold text-slate-900">{appointment.patientName}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-emerald-700 font-bold block uppercase tracking-wide">Consultation Fee</span>
                  <span className="text-sm font-bold text-slate-900">${Number(appointment.doctorFee || 0).toFixed(2)}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Diagnosis */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-emerald-600" />
                  Primary Diagnosis & Clinical Findings *
                </label>
                <textarea
                  required
                  rows="3"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Acute bronchitis with mild fever and bronchial inflammation"
                  className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none"
                ></textarea>
              </div>

              {/* Medicines */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  Prescribed Medicines & Dosage Schedule *
                </label>
                <textarea
                  required
                  rows="4"
                  value={medicines}
                  onChange={(e) => setMedicines(e.target.value)}
                  placeholder={`1. Amoxicillin 500mg - 1 capsule twice daily (after meals) for 5 days\n2. Paracetamol 650mg - 1 tablet as needed for fever\n3. Cough expectorant syrup - 10ml thrice daily`}
                  className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-mono outline-none"
                ></textarea>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Physician Advice & Lifestyle Notes
                </label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Drink plenty of warm fluids, rest for 3 days, follow up if fever persists beyond 48 hours."
                  className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none"
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Complete Consultation & Issue Bill</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default PrescriptionForm;
