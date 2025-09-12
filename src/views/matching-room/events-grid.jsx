import React, { useState } from 'react';
import { cn, useAPI } from 'components/lib';
import { Button } from 'components/shadcn/button';
import { Dialog, DialogContent } from 'components/shadcn/dialog';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
function monthLabel(d, locale){
  try {
    return new Intl.DateTimeFormat(locale || 'de-DE', { month: 'short', year: 'numeric' }).format(new Date(d));
  } catch { return ''; }
}

const EventsGrid = () => {
  const events = useAPI('/api/events/matching');
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
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

  const handleCardClick = (eventId) => {
    navigate(`/matching-room/${eventId}`);
  };
  function isOpenEvent(date) {
    const berlinNow = new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' });
    const today = new Date(berlinNow);
    today.setHours(0, 0, 0, 0); // today at 00:00 in Berlin time

    const eventDate = new Date(date);
    eventDate.setHours(23, 59, 0, 0); // normalize to 11:59

    const msPerDay = 1000 * 60 * 60 * 24;
    const daysDiff = (today.getTime() - eventDate.getTime()) / msPerDay;
    
    return today >= eventDate && daysDiff >= 0 && daysDiff < 28;
  }

  return (
    <>
      <section className="rounded-2xl  bg-white divide-y p-4 lg:p-8">
        {events?.data?.length > 0 ? (
          // events.data.map((ev, idx) => (
          //   <div 
          //     key={idx}
          //     className="flex items-center justify-between p-5 gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
          //     onClick={() => handleCardClick(ev._id)}
          //   >
          //     <div className="flex items-center gap-4">
          //       <div className="w-20 h-20rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white flex flex-col items-center justify-center shadow-md">
          //         <div className="text-3xl leading-none font-extrabold">{dayNumber(ev.date)}</div>
          //         <div className="text-[10px] uppercase tracking-wide opacity-90">{monthYearShort(ev.date, i18n.language)}</div>
          //       </div>
          //       <div>
          //         <div className="font-semibold text-slate-800">{ev.city?.name}</div>
          //         <div className="text-sm text-slate-500">{formatDateString(ev.date)}</div>
          //       </div>
          //     </div>

          //     <Button
          //       className="bg-red-600 text-white hover:bg-red-700 rounded-full px-4 py-1 text-xs"
          //       onClick={(e) => {
          //         e.stopPropagation();
          //         setCancelDialog({ open: true, event: ev, loading: false });
          //       }}
          //     >
          //       {t('dashboard.cancel', 'Cancel event')}
          //     </Button>
          //   </div>
          // ))
            events?.data?.map((ev, idx) => {
              const isOpen = ev?.date && isOpenEvent(ev.date);
              
              return <div key={idx} className="flex items-center justify-between py-6 gap-6 flex-col lg:flex-row">
                {/* Left side: date + city */}
                <div className="flex lg:items-center gap-4 lg:gap-6 w-full ">
                  {/* Date card */}
                  <div className="w-20 h-20 lg:w-[150px] lg:h-[150px] rounded-[20px] bg-gradient-to-br from-pink-500 to-rose-500 text-white flex flex-col items-center justify-center shadow-[0_4px_12px_#FE367866]">
                    <div className="text-3xl lg:text-[75px] font-extrabold leading-none">
                      {dayNumber(ev.date)}
                    </div>
                    <div className="text-[14px] font-medium opacity-90">
                      {monthLabel(ev.date, 'de-DE')}
                    </div>
                  </div>

                  {/* Event info */}
                  <div>
                    <div className="font-medium text-[25px] text-slate-900">{ev.city?.name}</div>
                    <div className="text-[25px] font-light text-slate-600">{formatDateString(ev.date)}</div>
                  </div>
                </div>

                {/* Right side: button */}
                {isOpen ? (
                  <Button
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(ev._id);
                    }}
                    className="text-sm font-semibold px-4 py-1 bg-black hover:bg-pink-700 text-white transition-colors duration-300"
                  >
                    {t('matching_room.join_now')}
                  </Button>) : <Button
                  className={cn("bg-red-600 text-white hover:bg-red-700 rounded-[14px] px-8 py-2 text-sm")}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCancelDialog({ open: true, event: ev, loading: false });
                  }}
                >
                  {t('dashboard.cancel', 'Cancel event')}
                </Button>
                }
                
              </div>
            })
           ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('matching_room.no_events_title', 'No events registered')}
            </h3>
            <p className="text-gray-500 max-w-sm">
              {t('matching_room.no_events_description', 'You haven\'t registered for any events yet. Check out upcoming events to join!')}
            </p>
          </div>
        )}
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

