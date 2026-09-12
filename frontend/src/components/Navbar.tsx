import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Layers,
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  LogOut,
  Users,
  Shield,
  Briefcase,
  Code,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useSocket } from '../context/SocketContext.js';
import { NotificationDropdown } from './NotificationDropdown.js';

export const Navbar: React.FC = () => {
  const { user, logout, switchDemoUser } = useAuth();
  const { onlineCount } = useSocket();
  const location = useLocation();

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'My Tasks', path: '/my-tasks', icon: CheckSquare },
  ];

  const roleBadgeStyle = {
    ADMIN: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    PROJECT_MANAGER: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    DEVELOPER: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  };

  const roleIcon = {
    ADMIN: Shield,
    PROJECT_MANAGER: Briefcase,
    DEVELOPER: Code,
  };

  const CurrentRoleIcon = user ? roleIcon[user.role] : Shield;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      {/* Top Demo Role Switcher Bar */}
      <div className="border-b border-slate-800/60 bg-slate-900/60 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Switch User:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => switchDemoUser('admin@velozity.com')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  user?.email === 'admin@velozity.com'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Admin (Aman)
              </button>
              <button
                onClick={() => switchDemoUser('sarah.pm@velozity.com')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  user?.email === 'sarah.pm@velozity.com'
                    ? 'bg-blue-500 text-white font-bold shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                PM 1 (Sarah)
              </button>
              <button
                onClick={() => switchDemoUser('marcus.pm@velozity.com')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  user?.email === 'marcus.pm@velozity.com'
                    ? 'bg-blue-500 text-white font-bold shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                PM 2 (Marcus)
              </button>
              <button
                onClick={() => switchDemoUser('ravi.dev@velozity.com')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  user?.email === 'ravi.dev@velozity.com'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Dev 1 (Ravi)
              </button>
              <button
                onClick={() => switchDemoUser('elena.dev@velozity.com')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  user?.email === 'elena.dev@velozity.com'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Dev 2 (Elena)
              </button>
            </div>
          </div>

          {/* Admin Live Presence Counter */}
          {user?.role === 'ADMIN' && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>{onlineCount} Online Now</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 group-hover:scale-105 transition">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-white block leading-none">
                  VELOZITY
                </span>
                <span className="text-[10px] text-blue-400 font-medium tracking-wider uppercase">
                  Project Pulse
                </span>
              </div>
            </Link>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname.startsWith(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right section: Presence, Notifications, Profile & Logout */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <NotificationDropdown />

            {/* User Profile Pill */}
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-white leading-tight">{user.name}</p>
                  <p className="text-[10px] text-slate-400">{user.email}</p>
                </div>

                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${
                    roleBadgeStyle[user.role]
                  }`}
                >
                  <CurrentRoleIcon className="w-3.5 h-3.5" />
                  <span>
                    {user.role === 'ADMIN'
                      ? 'Admin'
                      : user.role === 'PROJECT_MANAGER'
                      ? 'Project Manager'
                      : 'Developer'}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
