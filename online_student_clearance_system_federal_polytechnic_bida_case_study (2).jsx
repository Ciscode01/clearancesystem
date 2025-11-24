// Online Student Clearance System — Multi-Department Version
// Single-file React + Tailwind app (ready to paste into src/StudentClearanceApp.jsx)
// Features:
// - Departments can mark students as Cleared/Pending
// - Admin can declare final clearance only when all departments have cleared
// - Data persisted in localStorage so you can test and push to GitHub

import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';

// ---------- Helpers: LocalStorage persistence ----------
const LS_DEPTS = 'fpb_departments_v1';
const LS_STUDENTS = 'fpb_students_v1';

function loadDepartments(){
  const raw = localStorage.getItem(LS_DEPTS);
  if(raw) return JSON.parse(raw);
  const defaults = [
    { id: 1, code: 'REG', name: 'Registry' },
    { id: 2, code: 'LIB', name: 'Library' },
    { id: 3, code: 'ACC', name: 'Accounts' },
    { id: 4, code: 'ICT', name: 'ICT/Computer Centre' },
    { id: 5, code: 'DPT', name: 'Department Office' },
  ];
  localStorage.setItem(LS_DEPTS, JSON.stringify(defaults));
  return defaults;
}

function loadStudents(){
  const raw = localStorage.getItem(LS_STUDENTS);
  if(raw) return JSON.parse(raw);
  const defaults = [
    { id: 'FPB/2024/001', name: 'Amina Yusuf', level: 'ND II', programme: 'Computer Science', status: {1:'Cleared',2:'Cleared',3:'Pending',4:'Cleared',5:'Cleared'}, finalStatus: null },
    { id: 'FPB/2024/002', name: 'Ibrahim Musa', level: 'HND I', programme: 'Mechanical Engineering', status: {1:'Pending',2:'Cleared',3:'Cleared',4:'Pending',5:'Pending'}, finalStatus: null },
  ];
  localStorage.setItem(LS_STUDENTS, JSON.stringify(defaults));
  return defaults;
}

function saveDepartments(departments){ localStorage.setItem(LS_DEPTS, JSON.stringify(departments)); }
function saveStudents(students){ localStorage.setItem(LS_STUDENTS, JSON.stringify(students)); }

// ---------- UI Components ----------
function Nav({acting}){
  return (
    <nav className="bg-sky-800 text-white p-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="font-bold text-lg">FPB Clearance</Link>
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:underline">Dashboard</Link>
          <Link to="/students" className="hover:underline">Students</Link>
          <Link to="/students/new" className="hover:underline">Add Student</Link>
          <span className="text-sm opacity-90">Acting as: <strong>{acting.label}</strong></span>
        </div>
      </div>
    </nav>
  );
}

function Footer(){
  return <footer className="text-center text-sm p-4 text-gray-600">Case study: Federal Polytechnic Bida — Online Student Clearance System</footer>;
}

function Dashboard({students,departments}){
  const total = students.length;
  const fullyCleared = students.filter(s => s.finalStatus === 'Cleared' || Object.values(s.status).every(v => v === 'Cleared')).length;
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded shadow"><div className="text-sm text-gray-500">Total students</div><div className="text-3xl font-bold">{total}</div></div>
        <div className="p-4 bg-white rounded shadow"><div className="text-sm text-gray-500">Fully cleared</div><div className="text-3xl font-bold">{fullyCleared}</div></div>
        <div className="p-4 bg-white rounded shadow"><div className="text-sm text-gray-500">Departments</div><div className="text-3xl font-bold">{departments.length}</div></div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Recent students</h2>
        <table className="w-full text-left">
          <thead className="text-gray-600"><tr><th className="p-2">Matric</th><th>Name</th><th>Level</th><th>Programme</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id} className="border-t"><td className="p-2">{s.id}</td><td>{s.name}</td><td>{s.level}</td><td>{s.programme}</td><td>{s.finalStatus || (Object.values(s.status).every(v=>v==='Cleared')?'Cleared':'Pending')}</td><td><Link to={`/students/${encodeURIComponent(s.id)}`} className="text-sky-600">Open</Link></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StudentsList({students}){
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Students</h1>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full">
          <thead className="text-gray-600"><tr><th className="p-2">Matric</th><th>Name</th><th>Level</th><th>Programme</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {students.map(s=> (
              <tr key={s.id} className="border-t"><td className="p-2">{s.id}</td><td>{s.name}</td><td>{s.level}</td><td>{s.programme}</td><td>{s.finalStatus || (Object.values(s.status).every(v=>v==='Cleared')?'Cleared':'Pending')}</td><td className="p-2"><Link to={`/students/${encodeURIComponent(s.id)}`} className="text-sky-600">Open</Link></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddStudent({onAdd}){
  const navigate = useNavigate();
  const [form,setForm] = useState({id:'',name:'',level:'',programme:''});
  const handleChange = e => setForm({...form,[e.target.name]:e.target.value});
  const handleSubmit = e => {
    e.preventDefault();
    if(!form.id || !form.name) return alert('Matric and name required');
    onAdd({...form, status: {}, finalStatus: null});
    navigate('/students');
  };
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Add Student</h1>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
        <label className="block mb-2">Matric/ID<input name="id" value={form.id} onChange={handleChange} className="w-full border p-2 rounded"/></label>
        <label className="block mb-2">Full name<input name="name" value={form.name} onChange={handleChange} className="w-full border p-2 rounded"/></label>
        <label className="block mb-2">Level<input name="level" value={form.level} onChange={handleChange} className="w-full border p-2 rounded"/></label>
        <label className="block mb-4">Programme<input name="programme" value={form.programme} onChange={handleChange} className="w-full border p-2 rounded"/></label>
        <div className="flex justify-end gap-3"><button type="button" onClick={()=>navigate('/students')} className="px-4 py-2 bg-gray-400 text-white rounded">Cancel</button><button className="px-4 py-2 bg-sky-700 text-white rounded">Save</button></div>
      </form>
    </div>
  );
}

function StudentDetail({acting, onUpdateStudent}){
  const { id } = useParams();
  const studentId = decodeURIComponent(id);
  const [student,setStudent] = useState(null);
  const [departments,setDepartments] = useState([]);

  useEffect(()=>{
    const st = loadStudents().find(s=>s.id===studentId);
    setStudent(st||null);
    setDepartments(loadDepartments());
  },[studentId]);

  useEffect(()=>{
    // keep up to date if storage changed elsewhere
    const handler = ()=>{
      const st = loadStudents().find(s=>s.id===studentId);
      setStudent(st||null);
    };
    window.addEventListener('storage', handler);
    return ()=> window.removeEventListener('storage', handler);
  },[studentId]);

  if(!student) return <div className="max-w-6xl mx-auto p-6 text-red-500">Student not found</div>;

  const save = (updated)=>{
    const all = loadStudents().map(s=> s.id===studentId ? updated : s);
    saveStudents(all);
    setStudent(updated);
    onUpdateStudent(all);
  };

  const setDeptStatus = (deptId, status) => {
    // acting must be department or admin; departments update their own dept
    const updated = {...student, status: {...student.status, [deptId]: status}};
    // when a dept marks, clear finalStatus (admin must re-confirm)
    updated.finalStatus = null;
    save(updated);
    alert(`Department status updated: ${status}`);
  };

  // Student is only eligible for admin clearance if EVERY department has marked Cleared
const allCleared = departments.every(d => student.status[d.id] === 'Cleared');

  const adminDeclare = ()=>{
    if(!allCleared) return alert('Not all departments are cleared');
    const updated = {...student, finalStatus: 'Cleared'};
    save(updated);
    alert('Admin declared student fully cleared');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-semibold mb-3">{student.name} <span className="text-sm text-gray-500">({student.id})</span></h1>
        <div className="text-right">
          <div className="text-sm text-gray-600">Overall: <strong>{student.finalStatus || (allCleared ? 'All departments cleared — pending admin' : 'Pending')}</strong></div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Profile</h3>
          <p className="text-sm">Level: {student.level}</p>
          <p className="text-sm">Programme: {student.programme}</p>
        </div>

        <div className="md:col-span-2 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Clearance Status by Department</h3>
          <table className="w-full">
            <thead className="text-gray-600"><tr><th className="p-2">Department</th><th className="p-2">Status</th><th className="p-2">Action</th></tr></thead>
            <tbody>
              {departments.map(d => (
                <tr key={d.id} className="border-t">
                  <td className="p-2">{d.name}</td>
                  <td className="p-2">{student.status[d.id] || 'Pending'}</td>
                  <td className="p-2 space-x-2">
                    {/* Only allow a department acting as themselves to mark their dept. Admin can also mark all. */}
                    {acting.type === 'department' && acting.id === d.id && (
                      <>
                        <button onClick={()=>setDeptStatus(d.id,'Cleared')} className="px-2 py-1 bg-green-600 text-white rounded text-sm">Mark Cleared</button>
                        <button onClick={()=>setDeptStatus(d.id,'Pending')} className="px-2 py-1 bg-gray-400 text-white rounded text-sm">Mark Pending</button>
                      </>
                    )}
                    {acting.type === 'admin' && (
                      <>
                        <button onClick={()=>setDeptStatus(d.id,'Cleared')} className="px-2 py-1 bg-green-600 text-white rounded text-sm">Admin Cleared</button>
                        <button onClick={()=>setDeptStatus(d.id,'Pending')} className="px-2 py-1 bg-gray-400 text-white rounded text-sm">Admin Pending</button>
                      </>
                    )}
                    {!(acting.type === 'department' && acting.id === d.id) && acting.type !== 'admin' && (
                      <span className="text-sm text-gray-500">No access</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex items-center gap-3">
            <button onClick={adminDeclare} disabled={!allCleared || acting.type !== 'admin'} className={`px-4 py-2 ${allCleared && acting.type==='admin' ? 'bg-sky-700' : 'bg-gray-400'} text-white rounded`}>Admin: Declare Cleared</button>
            {acting.type !== 'admin' && <div className="text-sm text-gray-500">Switch to Admin to confirm final clearance once all departments cleared.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActingSelector({departments, acting, setActing}){
  // acting: {type:'admin'|'department'|'guest', id?, label}
  return (
    <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <label className="text-sm">Act as:&nbsp;</label>
        <select value={acting.type + (acting.id?`|${acting.id}`:'')} onChange={(e)=>{
          const v = e.target.value;
          if(v === 'admin'){ setActing({type:'admin', label:'Admin'}); return; }
          if(v === 'guest'){ setActing({type:'guest', label:'Guest'}); return; }
          const parts = v.split('|');
          const id = Number(parts[1]);
          const dept = departments.find(d=>d.id===id);
          if(dept) setActing({type:'department', id:dept.id, label:dept.name});
        }} className="border p-2 rounded">
          <option value="guest">Guest</option>
          <option value="admin">Admin</option>
          {departments.map(d=> <option key={d.id} value={`dept|${d.id}`}>{d.name}</option>)}
        </select>
      </div>
      <div className="text-sm text-gray-600">Note: Departments can only mark their own records. Admin can mark any.</div>
    </div>
  );
}

// ---------- App (wires everything together) ----------
export default function App(){
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);
  const [acting, setActing] = useState({type:'guest', label:'Guest'});

  useEffect(()=>{
    setDepartments(loadDepartments());
    setStudents(loadStudents());
  },[]);

  const handleAddStudent = (s)=>{
    // initialize status for all departments
    const status = {};
    loadDepartments().forEach(d=> status[d.id]= 'Pending');
    const newStudent = {...s, status, finalStatus: null};
    const all = [newStudent, ...loadStudents()];
    saveStudents(all);
    setStudents(all);
  };

  const handleUpdateStudents = (all)=>{ saveStudents(all); setStudents(all); };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Nav acting={acting} />
        <ActingSelector departments={departments} acting={acting} setActing={setActing} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Dashboard students={students} departments={departments} />} />
            <Route path="/students" element={<StudentsList students={students} />} />
            <Route path="/students/new" element={<AddStudent onAdd={handleAddStudent} />} />
            <Route path="/students/:id" element={<StudentDetail acting={acting} onUpdateStudent={handleUpdateStudents} />} />
            <Route path="*" element={<div className="max-w-6xl mx-auto p-6">Page not found</div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

const container = document.getElementById('root');
if(container) createRoot(container).render(<App />);
