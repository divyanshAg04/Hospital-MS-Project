import { useState, useEffect, useMemo } from 'react';
import { useStore } from './useStore';
import { Appointment, Department } from '@/types';

export interface AppointmentFilters {
  search: string;
  doctorId: string;
  departments: Department[];
  statuses: Appointment['status'][];
  date: string; // YYYY-MM-DD
}

export function useAppointments() {
  const {
    initializeStore,
    appointments,
    addAppointment,
    updateAppointment,
    patients,
    doctors
  } = useStore();

  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [activeDate, setActiveDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0]; // Default to today's date
  });

  const [filters, setFilters] = useState<AppointmentFilters>({
    search: '',
    doctorId: '',
    departments: [],
    statuses: [],
    date: '' // empty means no date filter in list view, or matched to activeDate in calendar
  });

  useEffect(() => {
    initializeStore();
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [initializeStore]);

  // Navigate active date
  const navigateDate = (direction: 'prev' | 'next' | 'today') => {
    const current = new Date(activeDate);
    if (direction === 'prev') {
      current.setDate(current.getDate() - 1);
    } else if (direction === 'next') {
      current.setDate(current.getDate() + 1);
    } else {
      setFilters(prev => ({ ...prev, date: '' }));
      setActiveDate(new Date().toISOString().split('T')[0]);
      return;
    }
    const newDateStr = current.toISOString().split('T')[0];
    setActiveDate(newDateStr);
    if (viewMode === 'calendar') {
      setFilters(prev => ({ ...prev, date: '' })); // Calendar uses activeDate
    }
  };

  // Filtered Appointments
  const processedAppointments = useMemo(() => {
    let list = [...appointments];

    // Connect patient and doctor names for search
    const getPatientName = (pId: string) => patients.find(p => p.id === pId)?.name.toLowerCase() || '';
    const getDocName = (dId: string) => doctors.find(d => d.id === dId)?.name.toLowerCase() || '';

    // Search filter
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.id.toLowerCase().includes(searchLower) ||
          getPatientName(a.patientId).includes(searchLower) ||
          getDocName(a.doctorId).includes(searchLower) ||
          a.reason.toLowerCase().includes(searchLower)
      );
    }

    // Doctor filter
    if (filters.doctorId) {
      list = list.filter((a) => a.doctorId === filters.doctorId);
    }

    // Department filter
    if (filters.departments.length > 0) {
      list = list.filter((a) => filters.departments.includes(a.department));
    }

    // Status filter
    if (filters.statuses.length > 0) {
      list = list.filter((a) => filters.statuses.includes(a.status));
    }

    // Date filter: List view uses filters.date (if specified), Calendar view strictly uses activeDate
    if (viewMode === 'calendar') {
      list = list.filter((a) => a.date === activeDate);
    } else if (filters.date) {
      list = list.filter((a) => a.date === filters.date);
    }

    // Sort by time (HH:MM)
    list.sort((a, b) => a.time.localeCompare(b.time));

    return list;
  }, [appointments, filters, viewMode, activeDate, patients, doctors]);

  // Statistics for active date
  const activeDateStats = useMemo(() => {
    const todayApts = appointments.filter(a => a.date === activeDate);
    const total = todayApts.length;
    const completed = todayApts.filter(a => a.status === 'Completed').length;
    const inProgress = todayApts.filter(a => a.status === 'In Progress').length;
    const scheduled = todayApts.filter(a => a.status === 'Scheduled').length;
    const checkedIn = todayApts.filter(a => a.status === 'Checked In').length;
    const criticalInNext30 = todayApts.filter(a => {
      if (a.status !== 'Scheduled' && a.status !== 'Checked In') return false;
      const [hour, min] = a.time.split(':').map(Number);
      const aptTime = new Date();
      aptTime.setHours(hour, min, 0);
      const diffMs = aptTime.getTime() - Date.now();
      return diffMs > 0 && diffMs <= 30 * 60 * 1000; // in next 30 minutes
    }).length;

    return { total, completed, inProgress, scheduled, checkedIn, criticalInNext30 };
  }, [appointments, activeDate]);

  const resetFilters = () => {
    setFilters({
      search: '',
      doctorId: '',
      departments: [],
      statuses: [],
      date: ''
    });
  };

  return {
    appointments: processedAppointments,
    allAppointments: appointments,
    activeDateStats,
    loading,
    viewMode,
    setViewMode,
    activeDate,
    setActiveDate,
    navigateDate,
    filters,
    setFilters,
    resetFilters,
    addAppointment,
    updateAppointment,
    patients,
    doctors
  };
}
