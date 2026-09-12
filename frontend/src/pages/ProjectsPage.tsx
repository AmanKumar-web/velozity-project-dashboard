import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  ArrowRight,
  AlertCircle,
  Building2,
  User as UserIcon,
} from 'lucide-react';
import { projectsApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { ProjectModal } from '../components/ProjectModal.js';
import { Project } from '../types/index.js';

export const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
    staleTime: 30000,
  });

  const canCreateProject = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Client Projects</h1>
          <p className="text-xs text-slate-400 mt-1">
            {user?.role === 'ADMIN'
              ? 'Global registry of active client contracts and deliverables.'
              : user?.role === 'PROJECT_MANAGER'
              ? 'Projects assigned to your project management portfolio.'
              : 'Projects containing tasks assigned to you.'}
          </p>
        </div>

        {canCreateProject && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded-xl transition shadow-lg shadow-blue-600/30"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        )}
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : projects?.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
          <FolderKanban className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No projects found</h3>
          <p className="text-xs text-slate-400 mt-1">
            {canCreateProject ? 'Click "New Project" to launch a client initiative.' : 'You are not assigned to any projects yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project) => {
            const totalTasks = project._count?.tasks || 0;
            const doneTasks = project.statusBreakdown?.DONE || 0;
            const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
            const overdueCount = project.overdueTasksCount || 0;

            return (
              <div
                key={project.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur hover:border-slate-700 transition group hover:shadow-xl"
              >
                <div>
                  {/* Client & Overdue tags */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 uppercase tracking-wide">
                      <Building2 className="w-3.5 h-3.5" />
                      {project.client?.company || project.client?.name}
                    </span>

                    {overdueCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        <AlertCircle className="w-3 h-3" />
                        {overdueCount} Overdue
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition">
                    {project.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-4">
                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                      <span>Progress</span>
                      <span className="font-semibold text-white">{progressPercent}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* PM Info & Task Counts */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[11px]">PM: {project.projectManager?.name}</span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-300">
                      {doneTasks}/{totalTasks} tasks done
                    </span>
                  </div>

                  {/* Navigation Link */}
                  <Link
                    to={`/projects/${project.id}`}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-blue-400 hover:text-blue-300 rounded-xl border border-slate-700/60 transition group-hover:border-blue-500/40"
                  >
                    Enter Workspace
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Modal */}
      <ProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
