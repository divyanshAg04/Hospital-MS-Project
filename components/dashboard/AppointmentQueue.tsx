'use client';

import React, { useState, useEffect } from 'react';
import { useAppointments } from '@/hooks/useAppointments';
import { StatusDot } from '../ui/StatusDot';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { EmptyState } from '../ui/EmptyState';
import { formatTime } from '@/lib/utils';
import { Check, ArrowRight, Eye, CalendarCheck } from 'lucide-react';
import Link from 'next/link';

export function AppointmentQueue() {
  const { appointments, loading, patients, doctors, updateAppointment } = useAppointments();
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => { if (res.ok) return res.json(); throw new Error(''); })
      .then((data) => { if (data.user) setCurrentUser(data.user); })
      .catch(() => {});
  }, []);

  // Get only today's appointments (already sorted by time) and slice max 8
  const todayApts = appointments.slice(0, 8);

  const getPatientName = (id: string) => patients.find(p => p.id === id)?.name || 'Unknown Patient';
  const getDocName = (id: string) => doctors.find(d => d.id === id)?.name || 'Unknown Doctor';

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Completed': return 'green';
      case 'In Progress': return 'amber';
      case 'Checked In': return 'blue';
      case 'Scheduled': return 'lavender';
      case 'Cancelled':
      case 'No Show': return 'red';
      default: return 'grey';
    }
  };

  return (
    <div className="glass-card p-6 flex flex-col justify-between select-none relative overflow-hidden h-full min-h-[360px]">
      {/* Header */}
      <div className="border-b border-border/50 pb-3 shrink-0 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Today&apos;s Appointment Queue</h3>
          <p className="text-[10px] text-foreground/45 mt-0.5 font-medium">Real-time outpatient consultation schedule</p>
        </div>
        <Link 
          href="/appointments"
          className="text-[10px] font-bold text-brand-teal hover:text-brand-teal/80 transition-colors flex items-center gap-1 shrink-0 outline-none"
        >
          View All <ArrowRight className="h-3 w-3 shrink-0" />
        </Link>
      </div>

      {/* List / Table Area */}
      <div className="flex-1 mt-4 relative">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 w-full rounded-xl bg-brand-surface animate-pulse" />
            ))}
          </div>
        ) : todayApts.length === 0 ? (
          <EmptyState 
            title="No Appointments Today" 
            description="There are no outpatient consultation slots booked for the current schedule date."
            icon={<CalendarCheck className="h-7 w-7" />}
            className="border-none py-8 bg-transparent"
          />
        ) : (
          <div className="overflow-x-auto scrollbar pb-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/40 text-foreground/45 uppercase text-[9px] font-black tracking-wider h-8">
                  <th className="pb-2 font-black">Time</th>
                  <th className="pb-2 font-black">Patient</th>
                  <th className="pb-2 font-black">Assigned Specialist</th>
                  <th className="pb-2 font-black">Department</th>
                  <th className="pb-2 font-black">Status</th>
                  <th className="pb-2 text-right font-black">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/25">
                {todayApts.map((apt) => {
                  const patientName = getPatientName(apt.patientId);
                  const docName = getDocName(apt.doctorId);
                  const isScheduled = apt.status === 'Scheduled';
                  const isCheckedIn = apt.status === 'Checked In';

                  return (
                    <tr key={apt.id} className="group hover:bg-[#4F8CFF]/5 transition-colors h-12">
                      {/* Time */}
                      <td className="font-mono font-bold text-foreground/80 pr-3">
                        {formatTime(apt.time)}
                      </td>
                      
                      {/* Patient Avatar + Name */}
                      <td className="pr-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={patientName} size="sm" />
                          <span className="font-bold text-foreground/90 truncate max-w-[120px]">{patientName}</span>
                        </div>
                      </td>

                      {/* Doctor Name */}
                      <td className="font-medium text-foreground/70 pr-3">
                        {docName}
                      </td>

                      {/* Department */}
                      <td className="pr-3">
                        <span className="text-foreground/45 font-medium">{apt.department}</span>
                      </td>

                      {/* Status badge */}
                      <td className="pr-3">
                        <div className="flex items-center gap-1.5">
                          <StatusDot status={apt.status} />
                          <Badge variant={getStatusVariant(apt.status) as any} className="text-[9px] uppercase font-bold py-0.5">
                            {apt.status}
                          </Badge>
                        </div>
                      </td>

                      {/* Quick Action Button */}
                      <td className="text-right">
                        {!['doctor', 'nurse'].includes(currentUser?.role || '') && (
                          <>
                            {isScheduled && (
                              <button
                                onClick={() => updateAppointment(apt.id, { status: 'Checked In' })}
                                className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg border border-brand-teal/20 text-brand-teal bg-brand-teal/5 hover:bg-brand-teal text-[10px] font-bold hover:text-brand-dark transition-all outline-none"
                              >
                                Check In
                              </button>
                            )}
                            {isCheckedIn && (
                              <button
                                onClick={() => updateAppointment(apt.id, { status: 'In Progress' })}
                                className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg border border-brand-amber/20 text-brand-amber bg-brand-amber/5 hover:bg-brand-amber text-[10px] font-bold hover:text-brand-dark transition-all outline-none"
                              >
                                Consult
                              </button>
                            )}
                            {apt.status === 'In Progress' && (
                              <button
                                onClick={() => updateAppointment(apt.id, { status: 'Completed' })}
                                className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg border border-brand-green/20 text-brand-green bg-brand-green/5 hover:bg-brand-green text-[10px] font-bold hover:text-brand-dark transition-all outline-none"
                              >
                                <Check className="h-3 w-3 stroke-[2.5]" /> Done
                              </button>
                            )}
                          </>
                        )}
                        {(apt.status === 'Completed' || apt.status === 'Cancelled' || apt.status === 'No Show' || ['doctor', 'nurse'].includes(currentUser?.role || '')) && (
                          <Link
                            href={`/appointments?id=${apt.id}`}
                            className="inline-flex items-center justify-center p-1 border border-border text-foreground/45 hover:text-brand-teal hover:border-brand-teal/30 hover:bg-brand-surface rounded-lg transition-colors outline-none"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
