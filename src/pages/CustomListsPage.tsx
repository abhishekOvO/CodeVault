import { useState } from 'react';
import { useStore } from '../store';
import { Plus, Trash2, FolderOpen, ArrowRight, X, Edit3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

const LIST_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
];

export default function CustomListsPage() {
  const customLists = useStore((s) => s.customLists);
  const createList = useStore((s) => s.createList);
  const deleteList = useStore((s) => s.deleteList);
  const renameList = useStore((s) => s.renameList);
  const problems = useStore((s) => s.problems);

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [color, setColor] = useState(LIST_COLORS[0]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return toast.error('Name is required');
    createList(name.trim(), desc.trim(), color);
    setName(''); setDesc(''); setColor(LIST_COLORS[0]);
    setShowCreate(false);
    toast.success('List created!');
  };

  const handleRename = (id: string) => {
    if (!editName.trim()) return;
    renameList(id, editName.trim());
    setEditId(null);
    toast.success('List renamed');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Custom Lists</h1>
          <p className="text-dark-400 text-sm mt-1">Organize problems into custom revision collections</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
          <Plus size={14} /> New List
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Create New List</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" placeholder="List name *" value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-base" />
            <input type="text" placeholder="Description (optional)" value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="input-base" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-dark-400">Color:</span>
            {LIST_COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)}
                className={cn('w-6 h-6 rounded-full transition-transform', color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-dark-900' : '')}
                style={{ background: c }} />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="btn-primary">Create</button>
            <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Preset lists */}
      <div>
        <h2 className="text-xs font-semibold text-dark-500 uppercase mb-3">Preset Suggestions</h2>
        <div className="flex flex-wrap gap-2">
          {['Interview Important', 'Weak Topics', 'Revisit Before Exam', 'Frequently Forgotten'].map((preset) => (
            <button key={preset}
              onClick={() => {
                createList(preset, '', LIST_COLORS[Math.floor(Math.random() * LIST_COLORS.length)]);
                toast.success(`"${preset}" list created`);
              }}
              className="btn-secondary text-xs py-1.5">
              <Plus size={11} /> {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Lists */}
      {customLists.length === 0 ? (
        <div className="card p-12 text-center">
          <FolderOpen size={40} className="mx-auto text-dark-600 mb-3" />
          <h3 className="text-white font-semibold mb-1">No custom lists yet</h3>
          <p className="text-dark-400 text-sm">Create lists to organize your revision</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {customLists.map((list) => {
            const listProblems = list.problemIds.map((id) => problems[id]).filter(Boolean);
            const solved = listProblems.filter((p) =>
              ['solved-independent', 'solved-hints', 'solved-after-solution'].includes(p.status)
            ).length;

            return (
              <div key={list.id} className="card-hover p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: list.color }} />
                    {editId === list.id ? (
                      <div className="flex gap-1.5 flex-1">
                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                          className="input-base text-xs py-1 flex-1" autoFocus
                          onKeyDown={(e) => { if (e.key === 'Enter') handleRename(list.id); }} />
                        <button onClick={() => handleRename(list.id)} className="btn-ghost text-xs py-1 text-emerald-400">✓</button>
                        <button onClick={() => setEditId(null)} className="btn-ghost text-xs py-1"><X size={11} /></button>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold text-white">{list.name}</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditId(list.id); setEditName(list.name); }}
                      className="p-1 text-dark-500 hover:text-dark-200 rounded transition-colors">
                      <Edit3 size={12} />
                    </button>
                    <button onClick={() => { deleteList(list.id); toast.success('List deleted'); }}
                      className="p-1 text-dark-500 hover:text-red-400 rounded transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                {list.description && (
                  <p className="text-xs text-dark-400">{list.description}</p>
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-dark-500">{listProblems.length} problems • {solved} solved</span>
                </div>
                {listProblems.length > 0 && (
                  <div className="progress-bar h-1">
                    <div className="progress-fill" style={{
                      width: `${listProblems.length ? (solved / listProblems.length) * 100 : 0}%`,
                      background: list.color,
                    }} />
                  </div>
                )}
                <div className="space-y-1 mt-1">
                  {listProblems.slice(0, 3).map((p) => (
                    <Link key={p.id} to={`/problems/${p.id}`}
                      className="flex items-center gap-2 text-xs text-dark-400 hover:text-dark-200 transition-colors truncate">
                      <span className="truncate">{p.title}</span>
                    </Link>
                  ))}
                  {listProblems.length > 3 && (
                    <span className="text-xs text-dark-500">+{listProblems.length - 3} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
