import apiClient from '@/lib/api-client';

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const reportService = {
  async downloadAttendancePdf(eventId: number) {
    const res = await apiClient.get(`/api/reports/events/${eventId}/attendance.pdf`, {
      responseType: 'blob',
    });
    downloadBlob(res.data as Blob, `attendance-event-${eventId}.pdf`);
  },

  async downloadSummaryExcel(eventId: number) {
    const res = await apiClient.get(`/api/reports/events/${eventId}/summary.xlsx`, {
      responseType: 'blob',
    });
    downloadBlob(res.data as Blob, `summary-event-${eventId}.xlsx`);
  },

  async downloadAllEventsExcel() {
    const res = await apiClient.get('/api/reports/events/export.xlsx', {
      responseType: 'blob',
    });
    downloadBlob(res.data as Blob, 'events-export.xlsx');
  },
};
