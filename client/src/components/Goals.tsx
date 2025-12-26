import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trophy } from 'lucide-react';
import type { User } from '../types';

interface Goal {
    id: number;
    name: string;
    target_amount: number;
    current_amount: number;
}

export default function Goals({ user }: { user: User }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', target: '' });
  const API_URL = "https://finance-tracker-q60v.onrender.com";

  useEffect(() => { loadGoals(); }, []);

  const loadGoals = () => axios.get(`${API_URL}/goals/${user.email}`).then(res => setGoals(res.data));

  const createGoal = async () => {
     await axios.post(`${API_URL}/goals`, {
        user_email: user.email,
        name: newGoal.name,
        target_amount: parseFloat(newGoal.target)
     });
     setShowForm(false);
     setNewGoal({ name: '', target: '' });
     loadGoals();
  };

  const addMoney = async (id: number) => {
      const amount = prompt("Enter amount to add:");
      if(amount) {
          await axios.put(`${API_URL}/goals/add-money`, { goal_id: id, amount_added: parseFloat(amount) });
          loadGoals();
      }
  };

  return (
    <div className="space-y-8">
       <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-stone-800">Savings Goals</h2>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-stone-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-stone-800 transition"
          >
             <Plus className="w-4 h-4" /> New Goal
          </button>
       </div>

       {showForm && (
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex gap-4 items-end">
               <div className="flex-1">
                   <label className="text-xs font-bold text-stone-400 uppercase">Goal Name</label>
                   <input className="w-full mt-1 p-3 bg-stone-50 rounded-xl outline-none" placeholder="e.g. New Laptop" value={newGoal.name} onChange={e=>setNewGoal({...newGoal, name: e.target.value})} />
               </div>
               <div className="flex-1">
                   <label className="text-xs font-bold text-stone-400 uppercase">Target Amount</label>
                   <input className="w-full mt-1 p-3 bg-stone-50 rounded-xl outline-none" type="number" placeholder="50000" value={newGoal.target} onChange={e=>setNewGoal({...newGoal, target: e.target.value})} />
               </div>
               <button onClick={createGoal} className="bg-blue-600 text-white p-3.5 rounded-xl font-bold">Save</button>
           </div>
       )}

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {goals.map(g => {
               const progress = Math.min((g.current_amount / g.target_amount) * 100, 100);
               return (
                   <div key={g.id} className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-50 relative overflow-hidden group">
                       <div className="flex justify-between items-start mb-4">
                           <div className="bg-stone-100 p-3 rounded-2xl group-hover:bg-yellow-100 transition-colors">
                               <Trophy className="w-6 h-6 text-stone-400 group-hover:text-yellow-600" />
                           </div>
                           <button onClick={() => addMoney(g.id)} className="text-xs font-bold bg-stone-900 text-white px-3 py-1.5 rounded-lg hover:scale-105 transition-transform">+ Add Money</button>
                       </div>
                       <h3 className="text-xl font-bold text-stone-800">{g.name}</h3>
                       <div className="flex justify-between items-end mt-2 mb-2">
                           <span className="text-2xl font-bold text-stone-800">₹{g.current_amount.toLocaleString()}</span>
                           <span className="text-xs font-bold text-stone-400">Target: {g.target_amount.toLocaleString()}</span>
                       </div>
                       <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
                           <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                       </div>
                   </div>
               )
           })}
       </div>
    </div>
  );
}