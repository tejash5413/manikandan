// ✅ Updated StudentFeeDetails.js with:
// - Delete button with confirmation
// - Payment month field
// - Search by rollno/name
// - Summary by class
// - Optional audit trail (commented for now)

import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaSave, FaEdit, FaTrash } from 'react-icons/fa';
import { collection, getDocs, getDoc, setDoc, doc,addDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';
import { adminDb as db, adminAuth as auth } from '../../services/firebase';

const StudentFeeDetails = () => {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
const [history, setHistory] = useState([]);
const [remainingBalance, setRemainingBalance] = useState(null);

  const [form, setForm] = useState({
    rollno: '', name: '', class: '', batch: '',
    totalFee: '', booksFee: '', otherFee: '', concession: '',
    amountPaid: '', paymentMode: 'Cash', paymentMonth: new Date().toISOString().slice(0, 7)
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [filterClass, setFilterClass] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [editing, setEditing] = useState(false);
  const [initialForm, setInitialForm] = useState(form);
const fetchPaymentHistory = async (rollno) => {
  if (!rollno) return;

  const snapshot = await getDocs(collection(db, 'student_fee_logs'));

  const filtered = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() })) // ✅ include document ID
    .filter(item => item.rollno === rollno)
    .sort((a, b) => b.loggedAt?.seconds - a.loggedAt?.seconds);

  setHistory(filtered);
};

  useEffect(() => {
    const checkAdmin = () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const token = await user.getIdTokenResult();
          if (token.claims.role === 'admin') {
            setIsAdmin(true);
            fetchFees();
          } else toast.error("\u274C Access denied. Admins only.");
        }
      });
    };
    checkAdmin();
  }, []);
useEffect(() => {
  const fetchStudents = async () => {
    const snapshot = await getDocs(collection(db, 'students_list'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setStudents(data);
  };
  fetchStudents();
}, []);
  useEffect(() => {
  const fetchStudentAndFeeInfo = async () => {
    if (!form.rollno) return;

    try {
      // 👤 Fetch student info
      const studentSnap = await getDoc(doc(db, 'students_list', form.rollno));
      if (studentSnap.exists()) {
        const student = studentSnap.data();
        setForm(prev => ({
          ...prev,
          name: student.name || '',
          class: student.class || '',
          batch: student.batch || ''
        }));
      } else {
        toast.warn("⚠️ Roll number not found in student list.");
        setForm(prev => ({ ...prev, name: '', class: '', batch: '' }));
      }

      // 💰 Fetch fee info
      const feeSnap = await getDoc(doc(db, 'student_fees', form.rollno));
      if (feeSnap.exists()) {
        const fee = feeSnap.data();
        setForm(prev => ({
          ...prev,
          totalFee: fee.totalFee || '',
          booksFee: fee.booksFee || '',
          otherFee: fee.otherFee || '',
          concession: fee.concession || '',
          amountPaid: fee.amountPaid || '',
          paymentMode: fee.paymentMode || 'Cash',
          paymentMonth: fee.paymentMonth || new Date().toISOString().slice(0, 7)
        }));
        setEditing(true);
        setInitialForm({ ...form, ...fee }); // For unsaved change detection
      }
    } catch (error) {
      toast.error("❌ Failed to fetch student or fee data.");
      console.error(error);
    }
  };

  fetchStudentAndFeeInfo();
}, [form.rollno]);

  const fetchFees = async () => {
    const snapshot = await getDocs(collection(db, 'student_fees'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setFees(data);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

const handleSave = async (e) => {
  e.preventDefault();
  const {
    rollno, name, class: cls, batch,
    totalFee, booksFee, otherFee, concession,
    amountPaid, paymentMode, paymentMonth
  } = form;

  if (!rollno || !name || !cls || !totalFee)
    return toast.warning("⚠️ Fill required fields");

  const safePaymentMonth = paymentMonth || new Date().toISOString().slice(0, 7);
  const parsedAmount = parseInt(amountPaid || 0);

  if (parsedAmount <= 0) {
    return toast.warning("⚠️ Enter a valid payment amount.");
  }

  const totalFeeNum = parseInt(totalFee || 0);
  const booksFeeNum = parseInt(booksFee || 0);
  const otherFeeNum = parseInt(otherFee || 0);
  const concessionNum = parseInt(concession || 0);

  const payable = totalFeeNum + booksFeeNum + otherFeeNum - concessionNum;

  const staticFeeData = {
    rollno,
    name,
    class: cls,
    batch,
    totalFee: totalFeeNum,
    booksFee: booksFeeNum,
    otherFee: otherFeeNum,
    concession: concessionNum,
    paymentMode,
    paymentMonth: safePaymentMonth,
    paymentDate: Timestamp.now()
  };

  try {
    // ✅ Step 1: Update static fee record
    await setDoc(doc(db, 'student_fees', rollno), staticFeeData);

    // ✅ Step 2: Calculate total paid so far from logs
    const logsSnap = await getDocs(collection(db, 'student_fee_logs'));
    const logs = logsSnap.docs
      .map(doc => doc.data())
      .filter(log => log.rollno === rollno);

    const totalPaidSoFar = logs.reduce((sum, log) => sum + (log.amountPaid || 0), 0);
    const remainingBalance = payable - (totalPaidSoFar + parsedAmount);

    // ✅ Step 3: Add this payment to student_fee_logs with balance
    await addDoc(collection(db, 'student_fee_logs'), {
      rollno,
      amountPaid: parsedAmount,
      payable,
      remainingBalance,
      paymentMode,
      paymentMonth: safePaymentMonth,
      loggedAt: Timestamp.now(),
      by: auth.currentUser?.email || 'admin',
      action: 'payment'
    });

    toast.success(`✅ Payment of ₹${parsedAmount} logged for ${rollno}`);

    // 🔄 Reset only payment-related fields for next entry
    setForm(prev => ({
      ...prev,
      amountPaid: '',
      paymentMode: 'Cash',
      paymentMonth: new Date().toISOString().slice(0, 7)
    }));

    setEditing(false);
    fetchFees();
    fetchPaymentHistory(rollno);
  } catch (err) {
    console.error("❌ Error saving payment:", err);
    toast.error("❌ Failed to save payment.");
  }
};
useEffect(() => {
  const computeRemainingBalance = async () => {
    if (!form.rollno) return;

    const totalFeeNum = parseInt(form.totalFee || 0);
    const booksFeeNum = parseInt(form.booksFee || 0);
    const otherFeeNum = parseInt(form.otherFee || 0);
    const concessionNum = parseInt(form.concession || 0);
    const payable = totalFeeNum + booksFeeNum + otherFeeNum - concessionNum;

    const logsSnap = await getDocs(collection(db, 'student_fee_logs'));
    const logs = logsSnap.docs
      .map(doc => doc.data())
      .filter(log => log.rollno === form.rollno);

    const totalPaid = logs.reduce((sum, log) => sum + (log.amountPaid || 0), 0);

    setRemainingBalance(payable - totalPaid);
  };

  computeRemainingBalance();
}, [form.rollno, form.totalFee, form.booksFee, form.otherFee, form.concession]);


const handleDeleteLog = async (logId) => {
  if (!window.confirm("⚠️ Delete this payment log?")) return;
  try {
    await deleteDoc(doc(db, 'student_fee_logs', logId));
    toast.success("🗑️ Log deleted");
    fetchPaymentHistory(form.rollno); // refresh table
  } catch (err) {
    console.error("❌ Error deleting log:", err);
    toast.error("❌ Failed to delete log");
  }
};
const handleEdit = (record) => {
  setForm(record);
  setInitialForm(record);
  setEditing(true);
  fetchPaymentHistory(record.rollno);

};
  const handleDelete = async (rollno) => {
    if (window.confirm(`Delete fee record for ${rollno}?`)) {
      await deleteDoc(doc(db, 'student_fees', rollno));
      toast.success(`\u1F5D1\uFE0F Deleted ${rollno}`);
      fetchFees();
    }
  };
const filteredStudents = students.filter(std => {
    return (filterClass === 'All' || std.class === filterClass) &&
           (std.name + std.rollno).toLowerCase().includes(searchTerm.toLowerCase());
  });
    const studentFeeMap = Object.fromEntries(fees.map(f => [f.rollno, f]));

  const combinedList = filteredStudents.map(std => ({ ...std, ...(studentFeeMap[std.rollno] || {}) }));

  
 const filteredFees = fees.filter(fee => {
  const classMatch = filterClass === 'All' || fee.class === filterClass;
  const total = fee.totalFee + (fee.booksFee || 0) + (fee.otherFee || 0) - (fee.concession || 0);
  const paid = fee.amountPaid || 0;
  const statusMatch = statusFilter === 'All' ||
    (statusFilter === 'Paid' && paid >= total) ||
    (statusFilter === 'Due' && paid < total);
return classMatch && statusMatch && (fee.name + fee.rollno).toLowerCase().includes(searchTerm.toLowerCase());

});

  const totalCollected = fees.reduce((sum, fee) => sum + (fee.amountPaid || 0), 0);
  const totalExpected = fees.reduce((sum, fee) => sum + (fee.totalFee || 0) + (fee.booksFee || 0) + (fee.otherFee || 0) - (fee.concession || 0), 0);
  const totalDue = totalExpected - totalCollected;

  const classSummary = fees.reduce((map, fee) => {
    const cls = fee.class || 'Unspecified';
    const total = (fee.totalFee || 0) + (fee.booksFee || 0) + (fee.otherFee || 0) - (fee.concession || 0);
    map[cls] = (map[cls] || 0) + total;
    return map;
  }, {});

  const formatDate = (ts) => ts?.toDate().toLocaleString('en-IN') ?? '-';

  if (!isAdmin) return <div className="text-center p-5">\ud83d\udd10 Admin access only</div>;
const classOptions = [
  ...Array.from({ length: 12 }, (_, i) => ({ value: `Class ${i + 1}`, label: `Class ${i + 1}` })),
  { value: "LT", label: "LT" },
  { value: "NEET Repeaters", label: "NEET Repeaters" },
  { value: "Crash Course", label: "Crash Course" },
  { value: "Integrated", label: "Integrated" },
  { value: "Class 12th NEET", label: "Class 12th NEET" },
  { value: "Class 12th JEE", label: "Class 12th JEE" },
  { value: "Class 11th NEET", label: "Class 11th NEET" },
  { value: "Class 11th JEE", label: "Class 11th JEE" },
];
const handleBack = () => {
  const formChanged = JSON.stringify(form) !== JSON.stringify(initialForm);
  if (!formChanged) {
    window.history.back();
    return;
  }

  toast.info(
    <div>
      <strong>⚠️ The changes you have made will be lost.</strong><br />
      Continue?
      <div className="mt-2 d-flex justify-content-end gap-2">
        <button className="btn btn-sm btn-outline-secondary" onClick={() => toast.dismiss()}>
          ❌ Cancel
        </button>
        <button className="btn btn-sm btn-danger" onClick={() => {
          toast.dismiss();
          window.history.back();
        }}>
          ✅ Yes, Go Back
        </button>
      </div>
    </div>,
    { autoClose: false }
  );
};
const getTotalPaidFromLogs = (rollno) => {
  return history
    .filter(log => log.rollno === rollno)
    .reduce((sum, log) => sum + (log.amountPaid || 0), 0);
};
  return (
    <div className="container py-4">
      <h3 className="mb-4 text-success"><FaMoneyBillWave /> Student Fee Management</h3>
<button className="btn btn-outline-secondary mb-3" onClick={handleBack}>
  ⬅️ Back
</button>

      <div className="row mb-3">
        {Object.entries(classSummary).map(([cls, amt]) => (
          <div className="col-auto" key={cls}>
            <div className="bg-light border p-2 rounded fw-bold">{cls}: ₹{amt.toLocaleString('en-IN')}</div>
          </div>
        ))}
      </div>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="bg-success bg-opacity-10 text-success border p-3 rounded shadow-sm text-center fw-bold">
            💰 Total Collected<br />₹{totalCollected.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="col-md-4">
          <div className="bg-primary bg-opacity-10 text-primary border p-3 rounded shadow-sm text-center fw-bold">
            📦 Total Expected<br />₹{totalExpected.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="col-md-4">
          <div className="bg-danger bg-opacity-10 text-danger border p-3 rounded shadow-sm text-center fw-bold">
            ❗ Total Due<br />₹{totalDue.toLocaleString('en-IN')}
          </div>
        </div>
      </div>
<div className="card p-3 mb-3 shadow-sm">
  <h5 className="mb-3">🔍 Search & Select Student</h5>
  <div className="row g-2">
    <div className="col-md-4">
      <select
        className="form-select"
        value={filterClass}
        onChange={(e) => setFilterClass(e.target.value)}
      >
        <option value="All">All Classes</option>
        {classOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
    <div className="col-md-4">
      <input
        type="text"
        className="form-control"
        placeholder="Search by Name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  </div>
  <div className="mt-3">
    {filteredStudents.length > 0 && (
      <div className="list-group">
        {filteredStudents.map(std => (
          <button
            key={std.id}
            className="list-group-item list-group-item-action"
            onClick={() => {
              setForm(prev => {
  const updated = {
    ...prev,
    rollno: std.rollno,
    name: std.name,
    class: std.class,
    batch: std.batch
  };
  setInitialForm(updated);
  fetchPaymentHistory(std.rollno);
  return updated;
});
              toast.info(`ℹ️ Selected ${std.name}`);
            }}
          >
            {std.name} ({std.rollno}) - {std.class}
          </button>
        ))}
      </div>
    )}
    {searchTerm && filteredStudents.length === 0 && (
      <div className="text-muted mt-2">No matching students found.</div>
    )}
  </div>
</div>
      <form className="card p-3 mb-4 shadow-sm" onSubmit={handleSave}>
        <div className="row g-2">
          {['rollno', 'name', 'class', 'batch'].map((field, i) => (
            <div className="col-md-3" key={i}>
              <input type="text" className="form-control" name={field} value={form[field]} onChange={handleChange} placeholder={field.toUpperCase()} required />
            </div>
          ))}
          <div className="col-md-3">
            <input type="number" className="form-control" name="totalFee" value={form.totalFee} onChange={handleChange} placeholder="Total Fee ₹" required />
          </div>
          <div className="col-md-3">
            <input type="number" className="form-control" name="booksFee" value={form.booksFee} onChange={handleChange} placeholder="Books Fee ₹" />
          </div>
          <div className="col-md-3">
            <input type="number" className="form-control" name="otherFee" value={form.otherFee} onChange={handleChange} placeholder="Other Fee ₹" />
          </div>
          <div className="col-md-3">
            <input type="number" className="form-control" name="concession" value={form.concession} onChange={handleChange} placeholder="Concession ₹" />
          </div>
          <div className="col-md-3">
            <input type="number" className="form-control" name="amountPaid" value={form.amountPaid} onChange={handleChange} placeholder="Amount Paid ₹" />
          </div>
          <div className="col-md-3">
            <select className="form-select" name="paymentMode" value={form.paymentMode} onChange={handleChange}>
              <option>Cash</option>
              <option>UPI</option>
              <option>Bank Transfer</option>
              <option>Card</option>
            </select>
          </div>
          <div className="col-md-3">
            <input type="month" className="form-control" name="paymentMonth" value={form.paymentMonth} onChange={handleChange} />
          </div>
        </div>
       <div className="d-flex justify-content-between align-items-center mt-3">
  <div>
    <span className={`badge fs-6 ${remainingBalance > 0 ? 'bg-warning text-dark' : 'bg-success'}`}>
      💰 Remaining Balance: ₹{remainingBalance ?? '...'}
    </span>
  </div>
  <button
    type="submit"
    className="btn btn-success px-4"
    disabled={remainingBalance <= 0}
  >
    <FaSave className="me-2" />
    💸 Add Payment
  </button>
</div>
      </form>
{history.length > 0 && (
  <div className="card p-3 mb-4 shadow-sm">
    <h5 className="mb-3">📜 Payment History for {form.rollno}</h5>
    <div className="table-responsive">
      <table className="table table-bordered table-sm">
        <thead className="table-light">
          <tr>
            <th>Date</th>
            <th>Amount Paid</th>
            <th>Payable</th>
            <th>Payment Mode</th>
            <th>Payment Month</th>
            <th>Action</th>
            <th>By</th>
            <th>Modify</th>

          </tr>
        </thead>
        <tbody>
          {history.map((entry, i) => {
            const payable = (entry.totalFee || 0) + (entry.booksFee || 0) + (entry.otherFee || 0) - (entry.concession || 0);
            
            return (
              <tr key={i}>
                <td>{entry.loggedAt?.toDate().toLocaleString('en-IN') ?? '-'}</td>
                <td>₹{entry.amountPaid || 0}</td>
                <td>₹{payable}</td>
                <td>{entry.paymentMode}</td>
                <td>{entry.paymentMonth}</td>
                <td>{entry.action}</td>
                <td>{entry.by}</td>
                <td>
  {isAdmin && (
    <button
      className="btn btn-sm btn-outline-danger"
      onClick={() => handleDeleteLog(entry.id)}
    >
      🗑️
    </button>
  )}
</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
)}
      <div className="d-flex justify-content-start gap-3 mb-3">
        <input
          type="text"
          className="form-control w-auto"
          placeholder="Search Roll No / Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
       <select
  value={filterClass}
  onChange={e => setFilterClass(e.target.value)}
  className="form-select w-auto"
>
  <option value="All">All</option>
  {classOptions.map(opt => (
    <option key={opt.value} value={opt.value}>
      {opt.label}
    </option>
  ))}
</select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-select w-auto">
          <option>All</option>
          <option>Paid</option>
          <option>Due</option>
        </select>
      </div>

      <div className="table-responsive shadow-sm">
        <table className="table table-bordered table-striped align-middle">
          <thead className="table-light">
            <tr>
              <th>Roll</th><th>Name</th><th>Class</th><th>Fee ₹</th><th>Books</th><th>Other</th><th>Concession</th>
              <th>Payable</th><th>Paid</th><th>Balance</th><th>Status</th><th>Mode</th><th>Month</th><th>Date</th><th>Edit</th><th>Delete</th>
            </tr>
          </thead>
          <tbody>
           {filteredFees.map(fee => {
  const payable = fee.totalFee + (fee.booksFee || 0) + (fee.otherFee || 0) - (fee.concession || 0);

  // ✅ Calculate total paid from history logs
  const totalPaid = history
    .filter(log => log.rollno === fee.rollno)
    .reduce((sum, log) => sum + (log.amountPaid || 0), 0);

  const balance = payable - totalPaid;
  const status = totalPaid >= payable ? "Paid" : "Due";

  return (
    <tr key={fee.id}>
      <td>{fee.rollno}</td>
      <td>{fee.name}</td>
      <td>{fee.class}</td>
      <td>₹{fee.totalFee}</td>
      <td>₹{fee.booksFee || 0}</td>
      <td>₹{fee.otherFee || 0}</td>
      <td>-₹{fee.concession || 0}</td>
      <td className="fw-bold text-primary">₹{payable}</td>
      <td>₹{totalPaid}</td> {/* ✅ updated */}
      <td className={`fw-bold ${balance > 0 ? 'text-danger' : 'text-success'}`}>₹{balance}</td>
      <td>
        <span className={`badge bg-${status === 'Paid' ? 'success' : 'warning'} text-dark`}>
          {status}
        </span>
      </td>
      <td>{fee.paymentMode}</td>
      <td>{fee.paymentMonth}</td>
      <td>{formatDate(fee.paymentDate)}</td>
      <td>
        <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(fee)}>
          <FaEdit />
        </button>
      </td>
      <td>
        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(fee.rollno)}>
          <FaTrash />
        </button>
      </td>
    </tr>
  );
})}

            {filteredFees.length === 0 && (
              <tr><td colSpan="16" className="text-center text-muted">No records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentFeeDetails;

