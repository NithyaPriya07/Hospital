import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  FileEdit, 
  Stethoscope, 
  Phone, 
  Calendar,
  AlertCircle 
} from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayQueue();
  }, []);

  const fetchTodayQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/appointments/doctor/today');
      setTodayAppointments(res.data);
    } catch (err) {
      console.error('Failed to load doctor appointments queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const bookedCount = todayAppointments.filter((a) => a.status === 'BOOKED').length;
  const completedCount = todayAppointments.filter((a) => a.status === 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Doctor Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-900/10 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide uppercase mb-2">
              Physician Consultation Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {user?.fullName}
            </h1>
            <p className="text-emerald-100 text-sm mt-1">
              Today's patient consultation queue and clinical prescriptions.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-right">
            <span className="text-xs text-emerald-200 block font-medium">Date</span>
            <span className="text-sm font-extrabold text-white">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <StatCard
            title="Total Today's Patients"
            value={todayAppointments.length}
            subtitle="Scheduled visits today"
            icon={Users}
            color="teal"
          />
          <StatCard
            title="Waiting in Queue"
            value={bookedCount}
            subtitle="Pending examination"
            icon={Clock}
            color="amber"
          />
          <StatCard
            title="Consulted & Completed"
            value={completedCount}
            subtitle="Prescription & bill generated"
            icon={CheckCircle2}
            color="green"
          />
        </div>

        {/* Today's Queue List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Today's Patient Queue</h2>
              <p className="text-xs text-slate-500 mt-0.5">Patients ordered by appointment token number</p>
            </div>
            <button
              onClick={fetchTodayQueue}
              className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors"
            >
              Refresh Queue
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-slate-500">Loading today's queue...</p>
            </div>
          ) : todayAppointments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-800">No appointments scheduled for today</h4>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                No patients are currently in your queue for today. New bookings will automatically appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-6">Token</th>
                    <th className="py-3.5 px-6">Patient Name</th>
                    <th className="py-3.5 px-6">Contact Phone</th>
                    <th className="py-3.5 px-6">Slot Time</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {todayAppointments.map((appt) => (
                    <tr key={appt.apptId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200">
                          #{appt.tokenNo}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{appt.patientName}</div>
                        <div className="text-xs text-slate-400">Patient ID: #{appt.patientId}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {appt.patientPhone || 'Not specified'}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {appt.apptTime}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={appt.status} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        {appt.status === 'BOOKED' ? (
                          <Link
                            to={`/doctor/prescribe/${appt.apptId}`}
                            state={{ appointment: appt }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
                          >
                            <FileEdit className="w-3.5 h-3.5" />
                            Prescribe & Complete
                          </Link>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Treated
                          </span>
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
    </div>
  );
};

export default DoctorDashboard;
