import React, { useEffect, useState } from 'react'; 
import { collection, getDocs } from 'firebase/firestore'; 
import { adminDb as db } from '../../services/firebase'; 
import { Bar, Line, Pie } from 'react-chartjs-2'; 
import 'chart.js/auto'; 
import { useNavigate } from 'react-router-dom'; 
const FeeDashboard = () => { 
const [students, setStudents] = useState([]); 
const [logs, setLogs] = useState([]); 
const [fees, setFees] = useState([]); 
const [filterClass, setFilterClass] = useState('All'); 
const [filterMonth, setFilterMonth] = useState(''); 
const navigate = useNavigate(); 
const classOptions = ['All', 'Class 11', 'Class 12', 'Crash Course', 'NEET Repeaters', 'LT']; 
useEffect(() => { 
const fetchAll = async () => { 
const stdSnap = await getDocs(collection(db, 'students_list')); 
const feeSnap = await getDocs(collection(db, 'student_fees')); 
const logSnap = await getDocs(collection(db, 'student_fee_logs')); 
setStudents(stdSnap.docs.map(d => d.data())); 
setFees(feeSnap.docs.map(d => d.data())); 
setLogs(logSnap.docs.map(d => d.data())); 
}; 
fetchAll(); 
}, []); 
const filteredStudents = students.filter(s => filterClass === 'All' || s.class === filterClass); 
const filteredFees = fees.filter(f => filteredStudents.find(s => s.rollno === f.rollno)); 
const filteredLogs = logs.filter(l => { 
const s = students.find(s => s.rollno === l.rollno); 
return s && (filterClass === 'All' || s.class === filterClass) && (!filterMonth || l.paymentMonth === filterMonth); 
}); 
const expectedTotal = filteredFees.reduce((sum, f) => { 
const payable = (f.totalFee || 0) + (f.booksFee || 0) + (f.otherFee || 0) - (f.concession || 0); 
return sum + payable; 
}, 0); 
const collectedTotal = filteredLogs.reduce((sum, l) => sum + (l.amountPaid || 0), 0); 
const dueTotal = expectedTotal - collectedTotal; 
const paidStudents = [...new Set(filteredLogs.map(l => l.rollno))]; 
const unpaidCount = filteredStudents.length - paidStudents.length; 
const activeThisMonth = logs.filter(l => l.paymentMonth === filterMonth).length; 
const feeModeCount = logs.reduce((map, log) => {
const mode = log.paymentMode || 'Unknown';
map[mode] = (map[mode] || 0) + (log.amountPaid || 0);
return map;
}, {});
const monthlyCollection = {};
logs.forEach(log => {
const m = log.paymentMonth;
monthlyCollection[m] = (monthlyCollection[m] || 0) + (log.amountPaid || 0);
});
const chartData = {
labels: Object.keys(monthlyCollection),
datasets: [{
label: 'Collected ₹',
data: Object.values(monthlyCollection),
backgroundColor: '#42a5f5'
}]
};
const modePie = {
labels: Object.keys(feeModeCount),
datasets: [{
label: 'Fee Mode',
data: Object.values(feeModeCount),
backgroundColor: ['#ff9800', '#4caf50', '#2196f3', '#9c27b0'] 
}]
};
return (
<div className="container py-4"> 
<h4 className="mb-4">📊 Detailed Fee Dashboard</h4> 
<div className="row mb-3"> 
<div className="col-md-4"> 
<select className="form-select" value={filterClass} onChange={e => setFilterClass(e.target.value)}> 
{classOptions.map(opt => <option key={opt}>{opt}</option>)} 
</select> 
</div> 
<div className="col-md-4"> 
<input type="month" className="form-control" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} /> 
</div> 
</div> 
<div className="d-flex flex-wrap gap-3 mt-4"> 
<button className="btn btn-outline-secondary" onClick={() => navigate('/admin-dashboard/students')}> 
👥 Manage Students 
</button> 
<button className="btn btn-outline-primary" onClick={() => navigate('/admin-dashboard/manage-fee')}> 
💳 Manage Fee Records 
</button> 
<button className="btn btn-outline-success" onClick={() => navigate('/admin-dashboard/analytics')}> 
📊 Detailed Analytics 
</button> 
</div> 
{/* Summary Cards */} 
<div className="row g-3 mb-4"> 
<SummaryCard title="Total Students" value={filteredStudents.length} icon="👨‍🎓" /> 
<SummaryCard title="Total Collected" value={`₹${collectedTotal.toLocaleString('en-IN')}`} icon="💰" color="success" /> 
<SummaryCard title="Total Expected" value={`₹${expectedTotal.toLocaleString('en-IN')}`} icon="📦" color="primary" /> 
<SummaryCard title="Outstanding Due" value={`₹${dueTotal.toLocaleString('en-IN')}`} icon="❗" color="danger" /> 
<SummaryCard title="Unpaid Students" value={unpaidCount} icon="🧍" color="warning" /> 
<SummaryCard title="Active This Month" value={activeThisMonth} icon="📅" color="info" /> 
</div> 
<div className="row g-4"> 
<div className="col-md-8"> 
<div className="card p-3 shadow-sm"> 
<h6 className="mb-3">📈 Monthly Collection</h6> 
<Bar data={chartData} /> 
</div> 
</div> 
<div className="col-md-4"> 
<div className="card p-3 shadow-sm"> 
<h6 className="mb-3">💳 Payment Mode Share</h6> 
<Pie data={modePie} /> 
</div> 
</div> 
</div> 
</div> 
); 
}; 
const SummaryCard = ({ title, value, icon, color = 'light' }) => ( 
<div className="col-md-4"> 
<div className={`border rounded text-center p-3 bg-${color} bg-opacity-10`}> 
<div className="fs-4">{icon}</div> 
<h5 className="mt-2">{value}</h5> 
<small className="text-muted">{title}</small> 
</div> 
</div> 
); 	
export default FeeDashboard; 

