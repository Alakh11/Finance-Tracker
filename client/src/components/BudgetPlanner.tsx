import { useState, useEffect } from 'react';
import axios from 'axios';
import type { User, BudgetCategory } from '../types';
import { Pencil, Save, AlertCircle } from 'lucide-react';

interface Props {
  user: User;
}

export default function BudgetPlanner({ user }: Props) {
  const [budgets, setBudgets] = useState<BudgetCategory[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [newLimit, setNewLimit] = useState('');
  const API_URL = "https://finance-tracker-q60v.onrender.com";

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    const res = await axios.get(`${API_URL}/budgets/${user.email}`);
    setBudgets(res.data);
  };

  const handleUpdate = async (categoryName: string) => {
    await axios.post(`${API_URL}/budgets`, {
      user_email: user.email,
      category_name: categoryName,
      limit: parseFloat(newLimit)
    });
    setEditing(null);
    fetchBudgets();
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Monthly Budget Planner</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((b) => {
          const percentage = b.budget_limit > 0 ? (b.spent / b.budget_limit) * 100 : 0;
          const isOverBudget = b.spent > b.budget_limit && b.budget_limit > 0;

          return (
            <div key={b.name} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: b.color }}></div>
                  <h3 className="font-bold text-lg text-gray-800">{b.name}</h3>
                </div>
                
                {/* Edit Mode Logic */}
                {editing === b.name ? (
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      className="w-24 border rounded p-1 text-sm"
                      placeholder="Limit"
                      value={newLimit}
                      onChange={(e) => setNewLimit(e.target.value)}
                    />
                    <button onClick={() => handleUpdate(b.name)} className="text-green-600"><Save size={18} /></button>
                  </div>
                ) : (
                  <button onClick={() => { setEditing(b.name); setNewLimit(String(b.budget_limit)); }} className="text-gray-400 hover:text-blue-600">
                    <Pencil size={16} />
                  </button>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-500">Spent: <b>₹{b.spent.toLocaleString()}</b></span>
                <span className="text-gray-500">Limit: <b>₹{b.budget_limit.toLocaleString()}</b></span>
              </div>
              
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>

              {isOverBudget && (
                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                  <AlertCircle size={12} /> Over budget by ₹{(b.spent - b.budget_limit).toLocaleString()}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}