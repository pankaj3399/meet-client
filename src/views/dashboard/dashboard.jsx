/***
*
*   DASHBOARD
*   Template dashboard example demonstrating various components inside a view.
*
**********/

import { useContext, useEffect, useMemo } from 'react';
import { ViewContext, Card, Stat, Chart, Table, Grid, Row, Animate, Feedback, useAPI, AuthContext, Icon } from 'components/lib';
import { Button } from 'components/shadcn/button';

export function Dashboard({ t }){

  // context
  const viewContext = useContext(ViewContext);
  const authContext = useContext(AuthContext);
  const events = useAPI('/api/events');
  const upcomingPastEvents = useAPI('/api/events/dashboard');

  // show welcome message
  useEffect(() => {
    viewContext.notification({ 
      
      title: t('dashboard.message.title'),
      description: t('dashboard.message.text'),
    
    });
  }, []);

  const nextEvent = upcomingPastEvents?.data?.upcoming?.event;
  const invitedFriends = upcomingPastEvents?.data?.upcoming?.invited_friends;

  const daysUntil = useMemo(() => {
    if (!nextEvent?.date) return null;
    const today = new Date();
    const eventDate = new Date(nextEvent.date);
    const ms = eventDate.setHours(0,0,0,0) - today.setHours(0,0,0,0);
    return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }, [nextEvent?.date]);

  function formatDateString(d){
    if (!d) return '';
    try {
      const formatter = new Intl.DateTimeFormat('de-DE', {
        timeZone: 'Europe/Berlin',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      return formatter.format(new Date(d));
    } catch {
      return '';
    }
  }

  function monthLabel(d, locale){
    try {
      return new Intl.DateTimeFormat(locale || 'de-DE', { month: 'short', year: 'numeric' }).format(new Date(d));
    } catch { return ''; }
  }

  function dayNumber(d){
    try { return new Intl.DateTimeFormat('de-DE', { day: '2-digit' }).format(new Date(d)); } catch { return ''; }
  }

  return (
    <Animate type='pop'>
      <div className="space-y-8 p-4 lg:p-12">
        <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">
          {t('dashboard.hey', 'Hey')} <span className="text-pink-600">{authContext?.user?.name}</span> <span role="img" aria-label="wave">👋</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Countdown + details card */}
          <div className="rounded-2xl bg-white shadow-md border border-slate-200 p-6">
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="col-span-1 flex flex-col items-center justify-center">
                <div className="text-5xl font-extrabold text-pink-600">{daysUntil ?? '—'}</div>
                <div className="text-xs text-slate-500 mt-1">{t('dashboard.days_until_event', 'Days until event')}</div>
              </div>
              <div className="col-span-2 space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <Icon name="calendar-days" size={16} />
                  <span>{formatDateString(nextEvent?.date)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <Icon name="map-pin" size={16} />
                  <span>{nextEvent?.city?.name || nextEvent?.location || '—'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <Icon name="users" size={16} />
                  <span>{authContext?.user?.name}{invitedFriends?.length ? `, ${invitedFriends.length} ${t('dashboard.with', 'With').toLowerCase()}` : ''}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet gradient card */}
          <div className="rounded-2xl p-6 text-white shadow-xl relative overflow-hidden bg-gradient-to-br from-pink-500 via-rose-500 to-red-500">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="text-xs opacity-90">{t('dashboard.your_balance', 'Your balance')}</div>
            <div className="mt-2 flex items-center gap-2 text-4xl font-extrabold">
              <span>{authContext?.user?.accounts?.[0]?.virtual_currency ?? 0}</span>
              <span>❤️</span>
            </div>
            <div className="mt-3 text-[12px] opacity-90 max-w-xs">
              {t('dashboard.balance_helper', 'Löse deine Herzen gegen wertvolle Vorteile ein.')}
            </div>
            <div className="mt-5">
              <button className="w-full h-9 rounded-full bg-white text-pink-600 text-sm font-semibold hover:bg-white/90 transition-colors">
                {t('dashboard.topup_now', 'Top up now')}
              </button>
            </div>
          </div>
        </div>

        {/* More events list */}
        <section className="space-y-3">
          <div>
            <div className="text-sm text-slate-500">{t('dashboard.more_events_head', 'More events,')}</div>
            <h2 className="text-lg font-semibold text-slate-800">{t('dashboard.more_events_sub', 'you shouldn\'t miss')}</h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white divide-y">
            {events?.data?.map((ev, idx) => (
              <div key={idx} className="flex items-center justify-between p-5 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white flex flex-col items-center justify-center shadow-md">
                    <div className="text-3xl leading-none font-extrabold">{dayNumber(ev.date)}</div>
                    <div className="text-[10px] uppercase tracking-wide opacity-90">{monthLabel(ev.date, 'de-DE')}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">{ev.city?.name}</div>
                    <div className="text-sm text-slate-500">{formatDateString(ev.date)}</div>
                  </div>
                </div>

                <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-md px-4 py-2 text-sm">
                  {t('dashboard.book_participation', 'Book participation')}
                </Button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Animate>
  );
}
