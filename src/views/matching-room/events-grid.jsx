import React, { useState } from 'react';
import { useNavigate } from 'components/lib';
import { useAPI } from 'components/lib';
import { Button } from 'components/shadcn/button';
import { Dialog, DialogContent } from 'components/shadcn/dialog';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

function formatDateString(d){
  try {
    const formatter = new Intl.DateTimeFormat('de-DE', {
      timeZone: 'Europe/Berlin',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(new Date(d));
  } catch { return ''; }
}

function dayNumber(d){
  try { return new Intl.DateTimeFormat('de-DE', { day: '2-digit' }).format(new Date(d)); } catch { return ''; }
}

function monthYearShort(d, locale){
  try { return new Intl.DateTimeFormat(locale || 'de-DE', { month: 'short', year: 'numeric' }).format(new Date(d)); } catch { return ''; }
}

const EventsGrid = () => {
  const navigate = useNavigate();
  const events = useAPI('/api/events/matching');
  const { t, i18n } = useTranslation();
  const [cancelDialog, setCancelDialog] = useState({ open: false, event: null, loading: false });

  const handleCancel = async (e) => {
    e.stopPropagation();
    if (!cancelDialog.event?._id) return;
    try {
      setCancelDialog(prev => ({ ...prev, loading: true }));
      await axios.post(`/api/events/${cancelDialog.event._id}/cancel`);
      setCancelDialog({ open: false, event: null, loading: false });
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setCancelDialog(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white divide-y">
        {events?.data?.map((ev, idx) => (
          <div key={idx} className="flex items-center justify-between p-5 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white flex flex-col items-center justify-center shadow-md">
                <div className="text-3xl leading-none font-extrabold">{dayNumber(ev.date)}</div>
                <div className="text-[10px] uppercase tracking-wide opacity-90">{monthYearShort(ev.date, i18n.language)}</div>
              </div>
              <div>
                <div className="font-semibold text-slate-800">{ev.city?.name}</div>
                <div className="text-sm text-slate-500">{formatDateString(ev.date)}</div>
              </div>
            </div>

            <Button
              className="bg-red-600 text-white hover:bg-red-700 rounded-full px-4 py-1 text-xs"
              onClick={() => setCancelDialog({ open: true, event: ev, loading: false })}
            >
              {t('dashboard.cancel', 'Cancel event')}
            </Button>
          </div>
        ))}
      </section>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialog.open} onOpenChange={(open) => setCancelDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-md bg-white">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('matching_room.cancel_title', 'Cancel Event?')}</h3>
            <p className="text-sm text-gray-600">
              {t('matching_room.cancel_copy', "Are you sure you want to cancel the event? You'll receive a voucher for a future event.")}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setCancelDialog({ open: false, event: null, loading: false })} 
                disabled={cancelDialog.loading}
              >
                {t('dashboard.cancel', 'Cancel')}
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white" 
                onClick={handleCancel} 
                disabled={cancelDialog.loading}
              >
                {cancelDialog.loading ? t('common.loading', 'Processing...') : t('common.confirm', 'Confirm')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventsGrid;
