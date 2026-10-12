import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { 
  Building2, 
  Stethoscope, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  AlertCircle,
  Tag,
  ArrowLeft,
  XCircle,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

const BookAppointment = () => {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('ALL');
  
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Default to today
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [apptDate, setApptDate] = useState(getTodayString);
  const [apptTime, setApptTime] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);

  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [bookingConfirmation, setBookingConfirmation] = useState(null);

  // Time slots covering morning, afternoon, and evening
  const timeSlots = [
    { label: '09:00 AM', value: '09:00:00', hour: 9, minute: 0 },
    { label: '10:00 AM', value: '10:00:00', hour: 10, minute: 0 },
    { label: '11:00 AM', value: '11:00:00', hour: 11, minute: 0 },
    { label: '12:00 PM', value: '12:00:00', hour: 12, minute: 0 },
    { label: '01:00 PM', value: '13:00:00', hour: 13, minute: 0 },
    { label: '02:00 PM', value: '14:00:00', hour: 14, minute: 0 },
    { label: '03:00 PM', value: '15:00:00', hour: 15, minute: 0 },
    { label: '04:00 PM', value: '16:00:00', hour: 16, minute: 0 },
    { label: '05:00 PM', value: '17:00:00', hour: 17, minute: 0 },
    { label: '06:00 PM', value: '18:00:00', hour: 18, minute: 0 },
    { label: '07:00 PM', value: '19:00:00', hour: 19, minute: 0 },
    { label: '08:00 PM', value: '20:00:00', hour: 20, minute: 0 },
  ];

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch (err) {
      console.error('Failed to load departments', err);
    }
  };

  useEffect(() => {
    loadDoctors(selectedDeptId);
  }, [selectedDeptId]);

  const loadDoctors = async (deptId) => {
    setLoading(true);
    try {
      const url = deptId === 'ALL' ? '/doctors' : `/doctors?deptId=${deptId}`;
      const res = await api.get(url);
      setDoctors(res.data);
      if (res.data.length > 0) {
        // Keep selected doctor if still in list, else select first
        const exists = res.data.find((d) => d.doctorId.toString() === selectedDoctorId);
        if (exists) {
          setSelectedDoctor(exists);
        } else {
          setSelectedDoctorId(res.data[0].doctorId.toString());
          setSelectedDoctor(res.data[0]);
        }
      } else {
        setSelectedDoctorId('');
        setSelectedDoctor(null);
      }
    } catch (err) {
      console.error('Failed to load doctors', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch booked slots whenever selected doctor or date changes
  useEffect(() => {
    if (selectedDoctorId && apptDate) {
      fetchBookedSlots(selectedDoctorId, apptDate);
    } else {
      setBookedSlots([]);
    }
  }, [selectedDoctorId, apptDate]);

  const fetchBookedSlots = async (doctorId, date) => {
    setSlotsLoading(true);
    try {
      const res = await api.get(`/appointments/booked-slots?doctorId=${doctorId}&date=${date}`);
      setBookedSlots(res.data || []);
    } catch (err) {
      console.error('Failed to fetch booked slots', err);
      setBookedSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleDoctorChange = (doctorId) => {
    setSelectedDoctorId(doctorId);
    const doc = doctors.find((d) => d.doctorId.toString() === doctorId);
    setSelectedDoctor(doc || null);
  };

  // Check if slot has already passed for today
  const isSlotPast = (slot) => {
    const todayStr = getTodayString();
    if (apptDate !== todayStr) return false;

    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

    if (slot.hour < currentHours) return true;
    if (slot.hour === currentHours && slot.minute <= currentMinutes) return true;
    return false;
  };

  // Check if slot is already booked for this doctor on this date
  const isSlotBooked = (slotValue) => {
    return bookedSlots.includes(slotValue);
  };

  // Auto-select first available slot if currently selected slot is invalid
  useEffect(() => {
    if (apptTime) {
      const slotObj = timeSlots.find((s) => s.value === apptTime);
      if (slotObj && (isSlotPast(slotObj) || isSlotBooked(slotObj.value))) {
        setApptTime('');
      }
    }
  }, [bookedSlots, apptDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      setError('Please select an available doctor.');
      return;
    }
    if (!apptTime) {
      setError('Please choose an available, non-booked time slot.');
      return;
    }

    const slotObj = timeSlots.find((s) => s.value === apptTime);
    if (slotObj && isSlotPast(slotObj)) {
      setError('The chosen time slot has already passed for today. Please select an upcoming slot.');
      return;
    }
    if (isSlotBooked(apptTime)) {
      setError('This slot was just booked by another patient. Please pick another slot.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const payload = {
        doctorId: Number(selectedDoctorId),
        apptDate,
        apptTime,
      };

      const response = await api.post('/appointments', payload);
      setBookingConfirmation(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Could not complete booking. The slot might already be reserved by another patient.'
      );
      // Refresh booked slots on collision
      fetchBookedSlots(selectedDoctorId, apptDate);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/patient/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        {bookingConfirmation ? (
          /* Confirmation Success Card */
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200 text-center max-w-xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10">
              <CheckCircle className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Appointment Confirmed!
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Your consultation is successfully booked. Please arrive 15 minutes before your time slot.
            </p>

            <div className="mt-8 p-6 bg-gradient-to-br from-brand-50 to-sky-50 rounded-2xl border border-brand-100 text-left">
              <div className="flex items-center justify-between border-b border-brand-200/60 pb-4 mb-4">
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-wider text-brand-700">
                    Your Queue Token Number
                  </span>
                  <div className="text-4xl font-extrabold text-brand-900 mt-0.5">
                    #{bookingConfirmation.tokenNo}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase font-bold text-slate-500">Status</span>
                  <div className="text-sm font-bold text-emerald-700 mt-0.5">
                    {bookingConfirmation.status}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Consulting Doctor</span>
                  <span className="font-bold text-slate-800">{bookingConfirmation.doctorName}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Department</span>
                  <span className="font-bold text-slate-800">{bookingConfirmation.departmentName}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Scheduled Date</span>
                  <span className="font-bold text-slate-800">{bookingConfirmation.apptDate}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Slot Time</span>
                  <span className="font-bold text-slate-800">{bookingConfirmation.apptTime}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setBookingConfirmation(null);
                  loadDepartments();
                  setApptTime('');
                }}
                className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50"
              >
                Book Another Slot
              </button>
              <Link
                to="/patient/dashboard"
                className="px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 shadow-md shadow-brand-600/20"
              >
                Go to My Appointments
              </Link>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200">
            <div className="border-b border-slate-100 pb-6 mb-6">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Book a Doctor's Appointment
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Browse specialists, check live slot availability, and reserve your appointment token.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Step 1: Select Department */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-brand-600" />
                    1. Filter by Medical Department
                  </label>
                  <span className="text-xs text-slate-400">
                    {departments.length} departments available
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDeptId('ALL')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      selectedDeptId === 'ALL'
                        ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    🌟 All Specialists ({doctors.length})
                  </button>

                  {departments.map((dept) => (
                    <button
                      key={dept.deptId}
                      type="button"
                      onClick={() => setSelectedDeptId(dept.deptId.toString())}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        selectedDeptId === dept.deptId.toString()
                          ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {dept.deptName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Select Doctor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-brand-600" />
                    2. Choose Specialist Doctor ({doctors.length} Available)
                  </label>
                </div>

                {loading ? (
                  <div className="p-8 text-center text-sm text-slate-400">
                    <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading specialists...
                  </div>
                ) : doctors.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-2xl text-slate-500 text-sm">
                    No doctors found for this department.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
                    {doctors.map((doc) => (
                      <div
                        key={doc.doctorId}
                        onClick={() => handleDoctorChange(doc.doctorId.toString())}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          selectedDoctorId === doc.doctorId.toString()
                            ? 'border-brand-500 bg-brand-50/70 shadow-sm ring-2 ring-brand-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm">{doc.fullName}</span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            ${Number(doc.fee).toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs text-brand-700 font-semibold mt-0.5">{doc.deptName}</div>
                        <p className="text-xs text-slate-500 mt-1">{doc.specialization}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 3: Date & Slot */}
              <div className="grid grid-cols-1 gap-5 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-brand-600" />
                    3. Select Consultation Date
                  </label>
                  <input
                    type="date"
                    required
                    value={apptDate}
                    min={getTodayString()}
                    onChange={(e) => setApptDate(e.target.value)}
                    className="w-full sm:w-72 px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {apptDate === getTodayString() && (
                    <span className="inline-block mt-1.5 text-xs text-brand-700 font-semibold bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-100">
                      ⚡ Booking for Today (past morning hours are automatically marked unavailable)
                    </span>
                  )}
                </div>

                {/* Step 4: Real-time Slot Availability Grid */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-brand-600" />
                      4. Live Time Slot Availability
                    </label>

                    {/* Slot Availability Legend */}
                    <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Booked
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Passed
                      </span>
                    </div>
                  </div>

                  {slotsLoading ? (
                    <div className="p-4 text-xs text-slate-400 text-center">Checking slot status...</div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {timeSlots.map((slot) => {
                        const isPast = isSlotPast(slot);
                        const isBooked = isSlotBooked(slot.value);
                        const isAvailable = !isPast && !isBooked;
                        const isSelected = apptTime === slot.value;

                        return (
                          <button
                            key={slot.value}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => setApptTime(slot.value)}
                            className={`p-3 rounded-xl text-left border flex flex-col justify-between transition-all ${
                              isSelected
                                ? 'bg-brand-600 text-white border-brand-600 shadow-md ring-2 ring-brand-400'
                                : isBooked
                                ? 'bg-rose-50/80 border-rose-200 text-rose-400 cursor-not-allowed opacity-80'
                                : isPast
                                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                : 'bg-white border-slate-200 text-slate-800 hover:border-brand-500 hover:bg-brand-50/30'
                            }`}
                          >
                            <span className="text-xs font-extrabold">{slot.label}</span>
                            <div className="mt-1.5">
                              {isSelected ? (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-100">
                                  ✓ Selected
                                </span>
                              ) : isBooked ? (
                                <span className="text-[10px] font-bold text-rose-600 bg-rose-100/70 px-1.5 py-0.5 rounded">
                                  🔴 Booked
                                </span>
                              ) : isPast ? (
                                <span className="text-[10px] font-medium text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
                                  ⏰ Passed
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                  🟢 Free
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Fee Notice and Submit */}
              {selectedDoctor && (
                <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-xs font-medium text-slate-600 block">Consulting Doctor</span>
                      <span className="text-sm font-bold text-slate-900">
                        {selectedDoctor.fullName} ({selectedDoctor.deptName})
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-medium">Consultation Fee</span>
                    <span className="text-base font-extrabold text-slate-900">
                      ${Number(selectedDoctor.fee).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !selectedDoctorId || !apptTime}
                className="w-full py-4 px-6 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Confirm & Generate Token</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default BookAppointment;
