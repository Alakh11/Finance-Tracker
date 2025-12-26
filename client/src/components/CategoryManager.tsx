import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';
import type { User, } from '../types';

export default function CategoryManager({ user }: { user: User }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [newCat, setNewCat] = useState({ name: '', color: '#3B82F6' });
  const API_URL = "https://finance-tracker-q60v.onrender.com";

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = () => axios.get(`${API_URL}/budgets/${user.email}`).then(res => setCategories(res.data));

  const addCategory = async () => {
    if(!newCat.name) return;
    await axios.post(`${API_URL}/categories`, {
        user_email: user.email,
        name: newCat.name,
        color: newCat.color,
        type: 'expense'
    });
    setNewCat({ name: '', color: '#3B82F6' });
    loadCategories();
  };

  const deleteCategory = async (id: number) => {
      if(confirm('Delete this category?')) {
          await axios.delete(`${API_URL}/categories/${id}`);
          loadCategories();
      }
  };

  return (
    <div className="space-y-8 animate-fade-in">
        <h2 className="text-3xl font-bold text-stone-800">Category Settings</h2>

        {/* Add New */}
        <div className="bg-white p-6 rounded-[2rem] border border-stone-50 shadow-sm flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
                <label className="text-xs font-bold text-stone-400 uppercase">Category Name</label>
                <input 
                    className="w-full mt-1 p-3 bg-stone-50 rounded-xl outline-none font-semibold"
                    placeholder="e.g. Gym, Pet Care"
                    value={newCat.name}
                    onChange={e => setNewCat({...newCat, name: e.target.value})}
                />
            </div>
            <div>
                <label className="text-xs font-bold text-stone-400 uppercase">Color</label>
                <div className="flex gap-2 mt-1">
                    {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'].map(c => (
                        <button 
                            key={c}
                            onClick={() => setNewCat({...newCat, color: c})}
                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${newCat.color === c ? 'border-stone-800' : 'border-transparent'}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>
            </div>
            <button onClick={addCategory} className="bg-stone-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-stone-800 transition">
                <Plus size={18} /> Add
            </button>
        </div>

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((cat: any) => (
                <div key={cat.name} className="bg-white p-4 rounded-2xl border border-stone-50 flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm" style={{ backgroundColor: cat.color }}>
                            {cat.name.charAt(0)}
                        </div>
                        <span className="font-bold text-stone-700">{cat.name}</span>
                    </div>
                    
                    <button onClick={() => deleteCategory(cat.id)} className="text-stone-300 hover:text-rose-500 transition">
                        <Trash2 size={18} />
                    </button>
                </div>
            ))}
        </div>
    </div>
  );
}