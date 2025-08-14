import React from 'react';
import { useNavigate } from 'components/lib';
import { useAPI } from 'components/lib';
import { Button } from 'components/shadcn/button';
import { useTranslation } from 'react-i18next';

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

  return (
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
            className="bg-black text-white hover:bg-black/90 rounded-full px-4 py-1 text-xs"
            onClick={() => navigate(`/matching-room/${ev._id}`)}
          >
            {t('dashboard.book_participation', 'Book participation')}
          </Button>
        </div>
      ))}
    </section>
  );
};

export default EventsGrid;
