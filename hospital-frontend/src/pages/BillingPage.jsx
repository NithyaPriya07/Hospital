import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { 
  CreditCard, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Stethoscope, 
  ShieldCheck, 
  Receipt, 
  AlertCircle,
  QrCode,
  Banknote,
  Printer,
  X
} from 'lucide-react';

const BillingPage = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Card'); // 'Card', 'UPI', 'Cash'
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('4532 8901 2345 7890');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('789');
  const [upiId, setUpiId] = useState('patient@okhdfcbank');
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [completedReceipt, setCompletedReceipt] = useState(null);

  useEffect(() => {
    fetchBills();
  }, []);

  useEffect(() => {
    if (user?.fullName && !cardHolder) {
      setCardHolder(user.fullName);
    }
  }, [user]);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bills/patient');
      setBills(res.data);
    } catch (err) {
      console.error('Failed to load bills:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayBill = async (e) => {
    e.preventDefault();
    if (!selectedBill) return;

    setError('');
    setPaying(true);

    try {
      await api.post('/payments', {
        billId: selectedBill.billId,
        method: paymentMethod.toUpperCase(),
        amount: selectedBill.totalAmount,
      });

      const receipt = {
        billId: selectedBill.billId,
        apptId: selectedBill.apptId,
        doctorName: selectedBill.doctorName,
        departmentName: selectedBill.departmentName,
        apptDate: selectedBill.apptDate,
        amount: selectedBill.totalAmount,
        method: paymentMethod,
        patientName: user?.fullName || 'Registered Patient',
        paidAt: new Date().toLocaleString(),
        receiptId: 'RCP-' + Math.floor(100000 + Math.random() * 900000),
      };

      setCompletedReceipt(receipt);
      setSelectedBill(null);
      fetchBills();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment processing failed.');
    } finally {
      setPaying(false);
    }
  };

  const totalAmountDue = bills
    .filter((b) => b.status === 'PENDING')
    .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);

  const totalAmountPaid = bills
    .filter((b) => b.status === 'PAID')
    .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner */}
        <div className="border-b border-slate-200 pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hospital Invoices & Billing
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Review your medical consultation invoices and complete settlements.
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <StatCard
            title="Total Invoices"
            value={bills.length}
            subtitle="Generated bills"
            icon={Receipt}
            color="blue"
          />
          <StatCard
            title="Pending Payment"
            value={`$${totalAmountDue.toFixed(2)}`}
            subtitle="Outstanding balance"
            icon={Clock}
            color="amber"
          />
          <StatCard
            title="Total Paid"
            value={`$${totalAmountPaid.toFixed(2)}`}
            subtitle="Cleared balance"
            icon={CheckCircle2}
            color="green"
          />
        </div>

        {/* Invoices List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Your Medical Invoices</h2>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {bills.length} bills recorded
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-slate-500">Loading your invoices...</p>
            </div>
          ) : bills.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Receipt className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-800">No bills generated yet</h4>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                Bills are generated automatically once a doctor finishes an appointment and writes a prescription.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-6">Invoice #</th>
                    <th className="py-3.5 px-6">Appointment & Doctor</th>
                    <th className="py-3.5 px-6">Consultation Date</th>
                    <th className="py-3.5 px-6">Total Amount</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bills.map((bill) => (
                    <tr key={bill.billId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-slate-800">
                        INV-{bill.billId.toString().padStart(5, '0')}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{bill.doctorName}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                          {bill.departmentName} (Appt #{bill.apptId})
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-700 font-medium">
                        {bill.apptDate}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-slate-900">
                        ${Number(bill.totalAmount).toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={bill.status} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        {bill.status === 'PENDING' ? (
                          <button
                            onClick={() => setSelectedBill(bill)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Pay Now
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-100">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Settled
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

      {/* Payment Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Settle Medical Invoice</h3>
                  <p className="text-xs text-slate-500">Invoice #{selectedBill.billId} • Appt #{selectedBill.apptId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBill(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-5">
              <div className="flex justify-between items-center text-sm mb-1.5">
                <span className="text-slate-500">Doctor</span>
                <span className="font-bold text-slate-900">{selectedBill.doctorName}</span>
              </div>
              <div className="flex justify-between items-center text-sm mb-1.5">
                <span className="text-slate-500">Department</span>
                <span className="font-medium text-slate-800">{selectedBill.departmentName}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-700">Total Settlement Amount</span>
                <span className="text-xl font-extrabold text-brand-700 font-mono">
                  ${Number(selectedBill.totalAmount).toFixed(2)}
                </span>
              </div>
            </div>

            <form onSubmit={handlePayBill} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'Card', label: 'Card', icon: CreditCard },
                    { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                    { id: 'Cash', label: 'Cash Desk', icon: Banknote },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = paymentMethod === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setPaymentMethod(item.id)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
                          isSelected
                            ? 'border-brand-500 bg-brand-50/80 text-brand-700 ring-2 ring-brand-500/20 shadow-sm'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-brand-600' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CARD PAYMENT DETAILS */}
              {paymentMethod === 'Card' && (
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Name on card"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4532 •••• •••• 8891"
                        maxLength="19"
                        className="w-full px-3 py-2 pl-9 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        maxLength="5"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        maxLength="4"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 italic">
                    Simulation Mode: Simulated payment form for demonstration. No real card details are billed.
                  </p>
                </div>
              )}

              {/* UPI PAYMENT DETAILS */}
              {paymentMethod === 'UPI' && (
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Virtual Payment Address (UPI ID)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="username@okhdfcbank"
                        className="w-full px-3 py-2 pl-9 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 flex-shrink-0">
                      <QrCode className="w-8 h-8 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Scan & Pay via UPI App</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Compatible with Google Pay, PhonePe, Paytm, and BHIM UPI.</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 italic">
                    Simulation Mode: Test payment request will be instantly settled.
                  </p>
                </div>
              )}

              {/* CASH PAYMENT DETAILS */}
              {paymentMethod === 'Cash' && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 animate-fadeIn">
                  <div className="flex items-start gap-2.5">
                    <Banknote className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-emerald-900">Hospital Billing Counter Settlement</h5>
                      <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                        Please present your appointment token at Cash Counter #1 or #2. Submitting below will mark this invoice as confirmed.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={paying}
                  className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {paying ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Confirm & Pay ${Number(selectedBill.totalAmount).toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Completed Payment Receipt Modal */}
      {completedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Receipt Header */}
            <div className="text-center pb-5 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-bold uppercase tracking-wider mb-1">
                Payment Settled & Cleared
              </span>
              <h3 className="text-lg font-black text-slate-900">CareSync Hospital</h3>
              <p className="text-xs text-slate-500">Official Patient Billing Receipt</p>
            </div>

            {/* Receipt Details Table */}
            <div className="py-5 space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Receipt Ref</span>
                <span className="font-mono font-bold text-slate-800">{completedReceipt.receiptId}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Invoice Number</span>
                <span className="font-mono font-bold text-slate-800">INV-{completedReceipt.billId.toString().padStart(5, '0')}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Patient</span>
                <span className="font-bold text-slate-900">{completedReceipt.patientName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Consulting Physician</span>
                <span className="font-bold text-slate-900">{completedReceipt.doctorName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Department</span>
                <span className="font-medium text-slate-800">{completedReceipt.departmentName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Consultation Date</span>
                <span className="text-slate-800">{completedReceipt.apptDate}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Payment Method</span>
                <span className="font-bold text-brand-700 uppercase">{completedReceipt.method}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-bold text-slate-800">Total Paid</span>
                <span className="text-xl font-black text-emerald-700 font-mono">
                  ${Number(completedReceipt.amount).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Receipt Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => setCompletedReceipt(null)}
                className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                <span>Done</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPage;
