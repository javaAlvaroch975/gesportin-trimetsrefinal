import { Pipe, PipeTransform } from '@angular/core';

/**
 * DatetimePipe
 * Uso:
 *  - {{ value | datetime }} -> completa (dd/MM/yyyy hh:mm)
 *  - {{ value | datetime:'solofechacompleta' }} -> dd/MM/yyyy
 *  - {{ value | datetime:'solofecha' }} -> dd/MM/yy
 *  - {{ value | datetime:'solohoracompleta' }} -> hh:mm:ss
 *  - {{ value | datetime:'solohora' }} -> hh:mm
 *
 *  Acepta Date | number (ms) | string (ISO or 'yyyy-MM-dd HH:mm:ss' etc).
 */

@Pipe({ name: 'datetime', standalone: true })
export class DatetimePipe implements PipeTransform {
  private pad(n: number, len = 2) {
    return n.toString().padStart(len, '0');
  }

  private tryParse(value: any): Date | null {
    if (value == null || value === '') return null;
    if (value instanceof Date) return value;
    if (typeof value === 'number') return new Date(value);
    if (typeof value === 'string') {
      const s = value.trim();
      // yyyy-MM-dd HH:mm:ss  -> replace space with T for Date parsing
      const ymd_hms = s.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})$/);
      if (ymd_hms) {
        const iso = `${ymd_hms[1]}T${ymd_hms[2]}`;
        const d = new Date(iso);
        if (!isNaN(d.getTime())) return d;
      }
      // yyyy-MM-dd HH:mm -> add seconds
      const ymd_hm = s.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})$/);
      if (ymd_hm) {
        const iso = `${ymd_hm[1]}T${ymd_hm[2]}:00`;
        const d = new Date(iso);
        if (!isNaN(d.getTime())) return d;
      }
      // yyyy-MM-dd (date only) -> treat as local date at midnight
      const ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (ymd) {
        const year = Number(ymd[1]);
        const month = Number(ymd[2]) - 1;
        const day = Number(ymd[3]);
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) return d;
      }

      // dd/MM/yyyy -> convert to yyyy-MM-dd
      const dmy = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (dmy) {
        const year = Number(dmy[3]);
        const month = Number(dmy[2]) - 1;
        const day = Number(dmy[1]);
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) return d;
      }

      // fallback to Date parsing (ISO or other browser-supported)
      const d = new Date(s);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  }

  transform(value: any, mode: string = 'completa'): string {
    const d = this.tryParse(value);
    if (!d) return '';

    const dd = this.pad(d.getDate());
    const mm = this.pad(d.getMonth() + 1);
    const yyyy = d.getFullYear().toString();
    const yy = yyyy.slice(-2);
    const hh = this.pad(d.getHours());
    const min = this.pad(d.getMinutes());
    const ss = this.pad(d.getSeconds());

    switch ((mode || 'completa').toLowerCase()) {
      case 'completa':
        // Mostramos fecha y hora (sin segundos) para la UI.
        return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
      case 'solofechacompleta':
        return `${dd}/${mm}/${yyyy}`;
      case 'solofecha':
        return `${dd}/${mm}/${yy}`;
      case 'solohoracompleta':
        return `${hh}:${min}:${ss}`;
      case 'solohora':
        return `${hh}:${min}`;
      default:
        return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
    }
  }
}
