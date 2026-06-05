export function cn(...classes: (string | undefined | null | boolean | Record<string, boolean>)[]) {
  const result: string[] = [];
  classes.forEach(c => {
    if (!c) return;
    if (typeof c === 'string') {
      result.push(c);
    } else if (typeof c === 'object') {
      Object.keys(c).forEach(key => {
        if (c[key]) result.push(key);
      });
    }
  });
  return result.join(' ');
}

// Consistent colored backgrounds based on name hash
export function getAvatarColor(name: string): { bg: string; text: string; border: string; glow: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const palettes = [
    { bg: 'bg-brand-teal/10', text: 'text-brand-teal', border: 'border-brand-teal/20', glow: 'glow-teal' },
    { bg: 'bg-brand-lavender/10', text: 'text-brand-lavender', border: 'border-brand-lavender/20', glow: 'glow-purple' },
    { bg: 'bg-brand-green/10', text: 'text-brand-green', border: 'border-brand-green/20', glow: 'glow-green' },
    { bg: 'bg-brand-amber/10', text: 'text-brand-amber', border: 'border-brand-amber/20', glow: 'glow-amber' },
    { bg: 'bg-brand-red/10', text: 'text-brand-red', border: 'border-brand-red/20', glow: 'glow-red' },
    { bg: 'bg-brand-cyan/10', text: 'text-brand-cyan', border: 'border-brand-cyan/20', glow: 'glow-blue' }
  ];

  const index = Math.abs(hash) % palettes.length;
  return palettes[index];
}

// Format ISO date or date string to "MMM DD, YYYY"
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
}

// Format "HH:MM" (24h) to "hh:mm AM/PM"
export function formatTime(time24: string): string {
  if (!time24) return '';
  const parts = time24.split(':');
  if (parts.length < 2) return time24;
  
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return time24;
  
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}

export function formatAge(dobString: string): number {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  const diffMs = Date.now() - dob.getTime();
  const ageDt = new Date(diffMs);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
}
