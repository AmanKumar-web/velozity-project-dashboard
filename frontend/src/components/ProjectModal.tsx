import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, AlertCircle } from 'lucide-react';
import { projectsApi, usersApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Client, User } from '../types/index.js';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  const [pmId, setPmId] = useState(user?.role === 'PROJECT_MANAGER' ? user.id : '');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch clients
  const { data: clients } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: usersApi.getClients,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch Project Managers if user is Admin
  const { data: pms } = useQuery<User[]>({
    queryKey: ['project_managers'],
    queryFn: () => usersApi.list('PROJECT_MANAGER'),
    enabled: user?.role === 'ADMIN',
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim() || !description.trim() || !clientId) {
        throw new Error('Please fill in all required fields.');
      }

      return projectsApi.create({
        title,
        description,
        clientId,
        pmId: user?.role === 'ADMIN' ? pmId || user.id : user?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      onClose();
      setTitle('');
      setDescription('');
      setClientId('');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to create project';
      setErrorMsg(msg);
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h3 className="text-base font-semibold text-white">Create New Project</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="p-6 space-y-4"
        >
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-950/50 border border-rose-800 rounded-lg text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Project Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Next-Gen Mobile Banking"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="High-level project scope and architecture goals..."
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Assign Client *</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select a Client</option>
              {clients?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.company})
                </option>
              ))}
            </select>
          </div>

          {user?.role === 'ADMIN' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Assign Project Manager</label>
              <select
                value={pmId}
                onChange={(e) => setPmId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Assign PM</option>
                {pms?.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
