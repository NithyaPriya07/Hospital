import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { 
  Calendar, 
  CreditCard, 
  Clock, 
  PlusCircle, 
  XCircle, 
  FileText, 
  AlertTriangle,
  Stethoscope,
  CheckCircle2,
  ChevronRight,
  Download
} from 'lucide-react';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePrescription, setActivePrescription] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [apptsRes, billsRes] = await Promise.all([
        api.get('/appointments/patient'),
        api.get('/bills/patient'),
      ]);
      setAppointments(apptsRes.data);
      setBills(billsRes.data);
    } catch (err) {
      console.error('Failed to load patient dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (apptId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setCancellingId(apptId);
    try {
      await api.put(`/appointments/${apptId}/cancel`);
      setMessage('Appointment cancelled successfully.');
      fetchDashboardData();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel appointment.');
    } finally {
      setCancellingId(null);
    }
  };

  const viewPrescription = async (apptId) => {
    try {
      const res = await api.get(`/prescriptions/appointment/${apptId}`);
      setActivePrescription(res.data);
    } catch (err) {
      alert('Could not retrieve prescription details.');
    }
  };

  const [downloadingPdf, setDownloadingPdf] = useState(null);

  const downloadPrescriptionPdf = async (prescId) => {
    try {
      setDownloadingPdf(prescId);
      const res = await api.get(`/prescriptions/${prescId}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Prescription-${prescId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Could not download prescription PDF. Please try again.');
    } finally {
      setDownloadingPdf(null);
    }
  };

  const downloadPrescriptionByAppt = async (apptId) => {
    try {
      setDownloadingPdf(apptId);
      const res = await api.get(`/prescriptions/appointment/${apptId}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Prescription-Appt-${apptId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Could not download prescription PDF. Please try again.');
    } finally {
      setDownloadingPdf(null);
    }
  };

  const pendingBills = bills.filter((b) => b.status === 'PENDING');
  const bookedAppointments = appointments.filter((a) => a.status === 'BOOKED');
  const completedAppointments = appointments.filter((a) => a.status === 'COMPLETED');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-sky-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-brand-700/10 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide uppercase mb-2">
              Patient Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {user?.fullName}!
            </h1>
            <p className="text-brand-100 text-sm mt-1">
              Track your scheduled consultations, medical prescriptions, and medical bills.
            </p>
          </div>
          <Link
            to="/patient/book"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-brand-700 font-bold text-sm shadow-md hover:bg-brand-50 transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-5 h-5 text-brand-600" />
            <span>Book New Appointment</span>
          </Link>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <StatCard
            title="Upcoming Bookings"
            value={bookedAppointments.length}
            subtitle="Scheduled visits"
            icon={Calendar}
            color="blue"
          />
          <StatCard
            title="Completed Visits"
            value={completedAppointments.length}
            subtitle="Treated & Prescribed"
            icon={CheckCircle2}
            color="green"
          />
          <StatCard
            title="Unpaid Invoices"
            value={pendingBills.length}
            subtitle={pendingBills.length > 0 ? "Requires settlement" : "All settled"}
            icon={CreditCard}
            color={pendingBills.length > 0 ? 'amber' : 'teal'}
          />
        </div>

        {/* Pending Bills Alert Banner */}
        {pendingBills.length > 0 && (
          <div className="mb-8 p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  You have {pendingBills.length} pending bill{pendingBills.length > 1 ? 's' : ''}
                </h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  Complete your payments to keep your health records updated.
                </p>
              </div>
            </div>
            <Link
              to="/patient/bills"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <span>View & Pay Bills</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Appointments Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Your Appointments</h2>
              <p className="text-xs text-slate-500 mt-0.5">History and scheduled clinical appointments</p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {appointments.length} total
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-slate-500">Loading your consultations...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-800">No appointments scheduled</h4>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                You haven't booked any doctor visits yet. Select a medical department and reserve a slot.
              </p>
              <Link
                to="/patient/book"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Book Appointment
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-6">Token</th>
                    <th className="py-3.5 px-6">Doctor & Department</th>
                    <th className="py-3.5 px-6">Date & Time</th>
                    <th className="py-3.5 px-6">Consultation Fee</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.map((appt) => (
                    <tr key={appt.apptId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-brand-600">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand-50 border border-brand-100">
                          #{appt.tokenNo}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{appt.doctorName}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                          {appt.departmentName}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-slate-900 font-medium">{appt.apptDate}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {appt.apptTime}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        ${Number(appt.doctorFee || 0).toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={appt.status} />
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        {appt.status === 'BOOKED' && (
                          <button
                            onClick={() => handleCancelAppointment(appt.apptId)}
                            disabled={cancellingId === appt.apptId}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Cancel
                          </button>
                        )}

                        {appt.hasPrescription && (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => viewPrescription(appt.apptId)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-brand-600 hover:bg-brand-50 border border-brand-200 transition-colors"
                              title="View Prescription Details"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              View
                            </button>
                            <button
                              onClick={() => downloadPrescriptionByAppt(appt.apptId)}
                              disabled={downloadingPdf === appt.apptId}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition-colors disabled:opacity-50"
                              title="Download Prescription PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                              {downloadingPdf === appt.apptId ? '...' : 'PDF'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Prescription Modal */}
      {activePrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Medical Prescription</h3>
                  <p className="text-xs text-slate-500">Visit on {activePrescription.apptDate}</p>
                </div>
              </div>
              <button
                onClick={() => setActivePrescription(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Doctor</span>
                <span className="font-bold text-slate-900">{activePrescription.doctorName}</span>
                <span className="text-xs text-slate-500 block">{activePrescription.departmentName}</span>
              </div>

              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Diagnosis</h5>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-800 border border-slate-100 whitespace-pre-wrap">
                  {activePrescription.diagnosis}
                </p>
              </div>

              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Medicines & Dosage</h5>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-800 border border-slate-100 font-mono text-xs whitespace-pre-wrap">
                  {activePrescription.medicines}
                </p>
              </div>

              {activePrescription.notes && (
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Doctor's Notes</h5>
                  <p className="p-3 bg-slate-50 rounded-xl text-slate-700 border border-slate-100 text-xs italic">
                    {activePrescription.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => downloadPrescriptionPdf(activePrescription.prescId)}
                disabled={downloadingPdf === activePrescription.prescId}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{downloadingPdf === activePrescription.prescId ? 'Generating PDF...' : 'Download PDF'}</span>
              </button>
              <button
                onClick={() => setActivePrescription(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
