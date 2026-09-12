import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Plus,
  Building2,
  User as UserIcon,
  FolderKanban,
  AlertCircle,
} from 'lucide-react';
import { projectsApi, tasksApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useSocket } from '../context/SocketContext.js';
import { TaskCard } from '../components/TaskCard.js';
import { TaskFilterBar } from '../components/TaskFilterBar.js';
import { ActivityFeed } from '../components/ActivityFeed.js';
import { TaskModal } from '../components/TaskModal.js';
import { Task } from '../types/index.js';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { joinProject, leaveProject } = useSocket();
  const [searchParams] = useSearchParams();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Auto-join project room on mount, leave on unmount
  useEffect(() => {
    if (id) {
      joinProject(id);
      return () => {
        leaveProject(id);
      };
    }
  }, [id, joinProject, leaveProject]);

  // Fetch project details
  const { data: project, isLoading: isProjectLoading, error: projectError } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getById(id!),
    enabled: Boolean(id),
  });

  // Fetch tasks with URL filters applied
  const filterParams = Object.fromEntries(searchParams.entries());
  const { data: tasks, isLoading: isTasksLoading } = useQuery<Task[]>({
    queryKey: ['tasks', id, filterParams],
    queryFn: () => tasksApi.list({ ...filterParams, projectId: id! }),
    enabled: Boolean(id),
  });

  const canManageTasks =
    user?.role === 'ADMIN' || (user?.role === 'PROJECT_MANAGER' && project?.pmId === user.id);

  if (isProjectLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Access Denied or Project Not Found</h2>
        <p className="text-xs text-slate-400 mt-2">
          You do not have permission to view this project or it does not exist.
        </p>
        <Link
          to="/projects"
          className="mt-4 inline-flex items-center gap-1 text-xs text-blue-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button & Breadcrumb */}
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Link>

        {/* Project Header Banner */}
        <div className="flex flex-wrap items-start justify-between gap-4 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur shadow-xl">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Building2 className="w-3.5 h-3.5" />
                {project.client?.name} ({project.client?.company})
              </span>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                PM: {project.projectManager?.name}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-white">{project.title}</h1>
            <p className="text-xs text-slate-300 leading-relaxed">{project.description}</p>
          </div>

          {canManageTasks && (
            <button
              onClick={() => {
                setTaskToEdit(null);
                setIsTaskModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded-xl transition shadow-lg shadow-blue-600/30"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          )}
        </div>
      </div>

      {/* Main Content Layout: Tasks + Live Activity Feed Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Task Filter Bar & Tasks Grid */}
        <div className="lg:col-span-2 space-y-4">
          <TaskFilterBar />

          {isTasksLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading tasks...</div>
          ) : tasks?.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
              <FolderKanban className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">No tasks match your filters</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing some filter parameters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tasks?.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={(t) => {
                    setTaskToEdit(t);
                    setIsTaskModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Project-scoped Real-Time Activity Feed */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <ActivityFeed
              projectId={project.id}
              title={`Live Feed: ${project.title}`}
              maxItems={20}
            />
          </div>
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
        defaultProjectId={project.id}
      />
    </div>
  );
};
