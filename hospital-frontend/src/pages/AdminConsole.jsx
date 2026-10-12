import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { 
  Shield, 
  DollarSign, 
  Calendar, 
  Users, 
  UserPlus, 
  Building2, 
  TrendingUp, 
  Stethoscope, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Filter,
  Eye,
  X,
  CreditCard,
  Clock,
  Phone,
  Mail,
  RefreshCw,
  PlusCircle
} from 'lucide-react';

const AdminConsole = () => {
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' | 'doctors' | 'patients' | 'reports' | 'departments'
  const [loading, setLoading] = useState(true);

  // Data states
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [reports, setReports] = useState(null);
  const [departments, setDepartments] = useState([]);

  // Appointment filters & search
  const [apptSearch, setApptSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Patient detail modal
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Doctor onboarding modal/form
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [docForm, setDocForm] = useState({
    fullName: '',
    email: '',
    password: '',
    deptId: '',
    specialization: '',
    fee: '',
  });
  const [docLoading, setDocLoading] = useState(false);
  const [docMsg, setDocMsg] = useState(null);

  // Department creation
  const [newDeptName, setNewDeptName] = useState('');
  const [deptLoading, setDeptLoading] = useState(false);
  const [deptMsg, setDeptMsg] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [apptsRes, docsRes, patsRes, repRes, deptRes] = await Promise.all([
        api.get('/admin/appointments'),
        api.get('/admin/doctors/details'),
        api.get('/admin/patients/details'),
        api.get('/admin/reports'),
        api.get('/departments'),
      ]);
      setAppointments(apptsRes.data || []);
      setDoctors(docsRes.data || []);
      setPatients(patsRes.data || []);
      setReports(repRes.data || null);
      setDepartments(deptRes.data || []);

      if (deptRes.data && deptRes.data.length > 0) {
        setDocForm((prev) => ({ ...prev, deptId: deptRes.data[0].deptId.toString() }));
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setDocLoading(true);
    setDocMsg(null);

    try {
      await api.post('/admin/doctors', {
        fullName: docForm.fullName.trim(),
        email: docForm.email.trim(),
        password: docForm.password,
        deptId: Number(docForm.deptId),
        specialization: docForm.specialization.trim(),
        fee: Number(docForm.fee),
      });

      setDocMsg({ type: 'success', text: `Dr. ${docForm.fullName} onboarded successfully!` });
      setDocForm({
        fullName: '',
        email: '',
        password: '',
        deptId: departments[0]?.deptId?.toString() || '',
        specialization: '',
        fee: '',
      });
      // Refresh doctor details immediately
      const updatedDocs = await api.get('/admin/doctors/details');
      setDoctors(updatedDocs.data || []);
      setTimeout(() => {
        setShowAddDoctorModal(false);
        setDocMsg(null);
      }, 1500);
    } catch (err) {
      setDocMsg({ type: 'error', text: err.response?.data?.message || 'Failed to onboard doctor.' });
    } finally {
      setDocLoading(false);
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    setDeptLoading(true);
    setDeptMsg(null);
    try {
      await api.post('/admin/departments', { deptName: newDeptName.trim() });
      setDeptMsg({ type: 'success', text: `Department "${newDeptName}" created!` });
      setNewDeptName('');
      const updatedDepts = await api.get('/departments');
      setDepartments(updatedDepts.data || []);
      setTimeout(() => setDeptMsg(null), 3000);
    } catch (err) {
      setDeptMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create department.' });
    } finally {
      setDeptLoading(false);
    }
  };

  // Filtered Appointments Logic
  const filteredAppointments = appointments.filter((appt) => {
    // Search query matches patient name or doctor name
    const matchesSearch = 
      appt.patientName.toLowerCase().includes(apptSearch.toLowerCase()) ||
      appt.doctorName.toLowerCase().includes(apptSearch.toLowerCase()) ||
      appt.deptName.toLowerCase().includes(apptSearch.toLowerCase());

    // Date filter
    const matchesDate = !filterDate || appt.apptDate === filterDate;

    // Department filter
    const matchesDept = filterDept === 'ALL' || appt.deptName === filterDept;

    // Status filter
    const matchesStatus = filterStatus === 'ALL' || appt.status === filterStatus;

    return matchesSearch && matchesDate && matchesDept && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Admin Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                Hospital Command Center
              </span>
              <span className="text-xs text-purple-200">Executive Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Hospital Management & Analytics
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              Track real-time patient-doctor bookings, monitor doctor caseloads, view patient clinical histories, and onboard medical staff.
            </p>
          </div>

          {/* Quick Tab Switcher */}
          <div className="flex flex-wrap gap-1 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 self-stretch lg:self-auto">
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'appointments' ? 'bg-white text-slate-900 shadow-sm' : 'text-purple-200 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Appointments ({appointments.length})
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'doctors' ? 'bg-white text-slate-900 shadow-sm' : 'text-purple-200 hover:text-white'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Doctors ({doctors.length})
            </button>
            <button
              onClick={() => setActiveTab('patients')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'patients' ? 'bg-white text-slate-900 shadow-sm' : 'text-purple-200 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Patients ({patients.length})
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'reports' ? 'bg-white text-slate-900 shadow-sm' : 'text-purple-200 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              KPIs & Reports
            </button>
            <button
              onClick={() => setActiveTab('departments')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'departments' ? 'bg-white text-slate-900 shadow-sm' : 'text-purple-200 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Departments
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-500">Loading hospital administration records...</p>
          </div>
        ) : (
          <>
            {/* ========================================================
                TAB 1: APPOINTMENTS (PATIENT BOOKED WITH WHICH DOCTOR)
               ======================================================== */}
            {activeTab === 'appointments' && (
              <div className="space-y-6">
                
                {/* Filters & Search Toolbar */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                  
                  {/* Search box */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={apptSearch}
                      onChange={(e) => setApptSearch(e.target.value)}
                      placeholder="Search by patient name, doctor name, or department..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
                    />
                  </div>

                  {/* Filter Dropdowns */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    
                    {/* Date Filter */}
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                      <span className="text-[11px] font-bold text-slate-400">Date:</span>
                      <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="bg-transparent text-xs text-slate-800 outline-none font-medium"
                      />
                      {filterDate && (
                        <button
                          onClick={() => setFilterDate('')}
                          className="text-[10px] text-rose-500 hover:text-rose-700 font-bold ml-1"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Department Filter */}
                    <select
                      value={filterDept}
                      onChange={(e) => setFilterDept(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="ALL">All Departments</option>
                      {departments.map((d) => (
                        <option key={d.deptId} value={d.deptName}>{d.deptName}</option>
                      ))}
                    </select>

                    {/* Status Filter */}
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="BOOKED">BOOKED</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>

                    <button
                      onClick={fetchAllData}
                      title="Refresh table"
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-slate-200"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Appointments Table */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Hospital Patient-Doctor Bookings</h2>
                      <p className="text-xs text-slate-500">Live roster of patient consultations across all hospital departments</p>
                    </div>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                      Showing {filteredAppointments.length} of {appointments.length} appointments
                    </span>
                  </div>

                  {filteredAppointments.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-xs">
                      No appointments match the selected filters or search query.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/80 text-[11px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
                          <tr>
                            <th className="py-3.5 px-5">Token</th>
                            <th className="py-3.5 px-5">Patient Name</th>
                            <th className="py-3.5 px-5">Consulting Doctor</th>
                            <th className="py-3.5 px-5">Department</th>
                            <th className="py-3.5 px-5">Date</th>
                            <th className="py-3.5 px-5">Time Slot</th>
                            <th className="py-3.5 px-5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {filteredAppointments.map((appt) => (
                            <tr key={appt.apptId} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-4 px-5">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-800 font-extrabold text-xs">
                                  #{appt.tokenNo}
                                </span>
                              </td>
                              <td className="py-4 px-5">
                                <div className="font-bold text-slate-900">{appt.patientName}</div>
                                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3 h-3" /> {appt.patientPhone || 'No phone'}
                                </div>
                              </td>
                              <td className="py-4 px-5">
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                                  {appt.doctorName}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono">Fee: ${Number(appt.doctorFee || 0).toFixed(2)}</div>
                              </td>
                              <td className="py-4 px-5">
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                  {appt.deptName}
                                </span>
                              </td>
                              <td className="py-4 px-5 text-slate-700 font-semibold">
                                {appt.apptDate}
                              </td>
                              <td className="py-4 px-5 text-slate-600 font-semibold flex items-center gap-1 mt-4">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {appt.apptTime}
                              </td>
                              <td className="py-4 px-5">
                                <StatusBadge status={appt.status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================
                TAB 2: DOCTORS (FULL DETAILS + ONBOARD FORM)
               ======================================================== */}
            {activeTab === 'doctors' && (
              <div className="space-y-6">
                
                {/* Header with Add Doctor CTA */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Hospital Medical Specialists</h2>
                    <p className="text-xs text-slate-500">Overview of physician credentials, specialization, caseload, and revenue generated</p>
                  </div>

                  <button
                    onClick={() => setShowAddDoctorModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Onboard New Doctor
                  </button>
                </div>

                {/* Doctors Table */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/80 text-[11px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="py-3.5 px-5">Doctor</th>
                          <th className="py-3.5 px-5">Department</th>
                          <th className="py-3.5 px-5">Specialization</th>
                          <th className="py-3.5 px-5">Consultation Fee</th>
                          <th className="py-3.5 px-5 text-center">Total Appointments</th>
                          <th className="py-3.5 px-5 text-center">Completed Visits</th>
                          <th className="py-3.5 px-5 text-right">Revenue Generated</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {doctors.map((doc) => (
                          <tr key={doc.doctorId} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-4 px-5">
                              <div className="font-bold text-slate-900">{doc.fullName}</div>
                              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3" /> {doc.email}
                              </div>
                            </td>
                            <td className="py-4 px-5">
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {doc.departmentName}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-slate-600">
                              {doc.specialization}
                            </td>
                            <td className="py-4 px-5 font-bold font-mono text-slate-800">
                              ${Number(doc.fee).toFixed(2)}
                            </td>
                            <td className="py-4 px-5 text-center">
                              <span className="inline-block px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                                {doc.totalAppointments}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-center">
                              <span className="inline-block px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                {doc.completedAppointments}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-right font-extrabold font-mono text-emerald-700 text-sm">
                              ${Number(doc.totalRevenue || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
                TAB 3: PATIENTS (FULL DETAILS + APPOINTMENT HISTORY MODAL)
               ======================================================== */}
            {activeTab === 'patients' && (
              <div className="space-y-6">
                
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                  <h2 className="text-base font-bold text-slate-900">Hospital Patient Directory</h2>
                  <p className="text-xs text-slate-500">Self-registered patients, total clinical consultations booked, and payments made</p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  {patients.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-xs">
                      No patients have registered yet. New patient accounts created via the Register page will appear here.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/80 text-[11px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
                          <tr>
                            <th className="py-3.5 px-5">Patient Name</th>
                            <th className="py-3.5 px-5">Email Address</th>
                            <th className="py-3.5 px-5">Contact Phone</th>
                            <th className="py-3.5 px-5 text-center">Total Appointments</th>
                            <th className="py-3.5 px-5 text-right">Total Amount Paid</th>
                            <th className="py-3.5 px-5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {patients.map((pat) => (
                            <tr key={pat.patientId} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-4 px-5">
                                <div className="font-bold text-slate-900">{pat.fullName}</div>
                                <div className="text-[11px] text-slate-400">ID #{pat.patientId} {pat.gender ? `• ${pat.gender}` : ''}</div>
                              </td>
                              <td className="py-4 px-5 text-slate-600 font-mono">
                                {pat.email}
                              </td>
                              <td className="py-4 px-5 text-slate-600">
                                {pat.phone || 'Not provided'}
                              </td>
                              <td className="py-4 px-5 text-center">
                                <span className="inline-block px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                                  {pat.totalAppointments}
                                </span>
                              </td>
                              <td className="py-4 px-5 text-right font-extrabold font-mono text-emerald-700">
                                ${Number(pat.totalAmountPaid || 0).toFixed(2)}
                              </td>
                              <td className="py-4 px-5 text-right">
                                <button
                                  onClick={() => setSelectedPatient(pat)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors border border-indigo-200"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  View History
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================
                TAB 4: REPORTS & KPIS
               ======================================================== */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <StatCard
                    title="Total Revenue"
                    value={`$${Number(reports?.totalRevenue || 0).toFixed(2)}`}
                    subtitle="Settled invoices"
                    icon={DollarSign}
                    color="teal"
                  />
                  <StatCard
                    title="Total Appointments"
                    value={reports?.totalAppointments || 0}
                    subtitle="All bookings"
                    icon={Calendar}
                    color="blue"
                  />
                  <StatCard
                    title="Registered Patients"
                    value={reports?.totalPatients || 0}
                    subtitle="Patient records"
                    icon={Users}
                    color="green"
                  />
                  <StatCard
                    title="Active Specialists"
                    value={reports?.totalDoctors || 0}
                    subtitle="Doctors on duty"
                    icon={Stethoscope}
                    color="purple"
                  />
                </div>

                {/* Analytical breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Daily Appointments Trend */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-bold text-slate-900 text-sm">Appointments Per Day</h3>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">Volume Trend</span>
                    </div>

                    {reports?.appointmentsPerDay?.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">No appointment records yet.</p>
                    ) : (
                      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                        {reports?.appointmentsPerDay?.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-xs font-semibold text-slate-800">{item.date}</span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-800">
                              {item.count} appointments
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Patients Per Doctor */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        <h3 className="font-bold text-slate-900 text-sm">Patients Per Doctor</h3>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">Caseload breakdown</span>
                    </div>

                    {reports?.patientsPerDoctor?.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">No doctor caseload data yet.</p>
                    ) : (
                      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                        {reports?.patientsPerDoctor?.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-xs font-semibold text-slate-800">{item.doctorName}</span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple-100 text-purple-800">
                              {item.patientCount} unique patients
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
                TAB 5: DEPARTMENTS (CONFIG & NEW DEPARTMENT)
               ======================================================== */}
            {activeTab === 'departments' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Create Department Form */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Create New Department</h3>
                      <p className="text-[11px] text-slate-500">Configure new clinical division in the hospital</p>
                    </div>
                  </div>

                  {deptMsg && (
                    <div className={`mb-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                      deptMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {deptMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      <span>{deptMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleCreateDepartment} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Department Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newDeptName}
                        onChange={(e) => setNewDeptName(e.target.value)}
                        placeholder="e.g. Dermatology & Cosmetology"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-xs outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={deptLoading}
                      className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all disabled:opacity-50"
                    >
                      {deptLoading ? 'Creating Department...' : 'Create Department'}
                    </button>
                  </form>
                </div>

                {/* Existing Departments List */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-900 text-sm mb-4">Existing Departments ({departments.length})</h3>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {departments.map((dept) => (
                      <div key={dept.deptId} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="font-bold text-xs text-slate-800">{dept.deptName}</span>
                        <span className="text-[11px] font-mono text-slate-400">Dept ID #{dept.deptId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ========================================================
          MODAL 1: PATIENT DETAIL & FULL APPOINTMENT HISTORY
         ======================================================== */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-extrabold text-sm">
                  {selectedPatient.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedPatient.fullName}</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedPatient.email} • {selectedPatient.phone || 'No phone'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Patient KPI Header */}
            <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 mb-4 text-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Bookings</span>
                <span className="text-sm font-black text-slate-900">{selectedPatient.totalAppointments}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Settled Payments</span>
                <span className="text-sm font-black text-emerald-700 font-mono">${Number(selectedPatient.totalAmountPaid || 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Gender & DOB</span>
                <span className="text-xs font-bold text-slate-800">{selectedPatient.gender || 'N/A'} • {selectedPatient.dob || 'N/A'}</span>
              </div>
            </div>

            {/* Appointment History List */}
            <div className="flex-1 overflow-y-auto pr-1">
              <h4 className="text-xs font-bold text-slate-700 mb-2.5">Consultation History ({selectedPatient.appointments?.length || 0})</h4>
              
              {selectedPatient.appointments?.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">No clinical appointments recorded for this patient.</p>
              ) : (
                <div className="space-y-2">
                  {selectedPatient.appointments.map((h) => (
                    <div key={h.apptId} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                          {h.doctorName} <span className="text-slate-400 font-normal">({h.departmentName})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span className="font-semibold">{h.apptDate}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" />{h.apptTime}</span>
                          <span>•</span>
                          <span className="font-bold text-indigo-700">Token #{h.tokenNo}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={h.status} />
                        <span className="text-[11px] font-mono text-slate-500 block mt-1">${Number(h.fee || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: ONBOARD NEW DOCTOR FORM
         ======================================================== */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Onboard Medical Specialist</h3>
                  <p className="text-[11px] text-slate-500">Creates User (role DOCTOR) and Doctor profile in one transaction</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddDoctorModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {docMsg && (
              <div className={`mb-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                docMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {docMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{docMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleCreateDoctor} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Doctor Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={docForm.fullName}
                  onChange={(e) => setDocForm({ ...docForm, fullName: e.target.value })}
                  placeholder="e.g. Dr. Arthur Conan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Login Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={docForm.email}
                    onChange={(e) => setDocForm({ ...docForm, email: e.target.value })}
                    placeholder="doctor.arthur@hospital.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={docForm.password}
                    onChange={(e) => setDocForm({ ...docForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Department *
                  </label>
                  <select
                    required
                    value={docForm.deptId}
                    onChange={(e) => setDocForm({ ...docForm, deptId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-xs outline-none bg-white"
                  >
                    {departments.map((d) => (
                      <option key={d.deptId} value={d.deptId}>{d.deptName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Consultation Fee ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={docForm.fee}
                    onChange={(e) => setDocForm({ ...docForm, fee: e.target.value })}
                    placeholder="75.00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Clinical Specialization *
                </label>
                <input
                  type="text"
                  required
                  value={docForm.specialization}
                  onChange={(e) => setDocForm({ ...docForm, specialization: e.target.value })}
                  placeholder="e.g. Cardiothoracic Surgery"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-xs outline-none"
                />
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddDoctorModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={docLoading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {docLoading ? 'Registering...' : 'Register Specialist Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminConsole;
