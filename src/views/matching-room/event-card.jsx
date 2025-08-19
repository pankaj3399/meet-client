import React from 'react';
import { Button } from 'components/shadcn/button';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

import axios from 'axios';
import { Dialog, DialogContent } from 'components/shadcn/dialog';
import { useState } from 'react';
const EventCard = ({ event, onClick }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  function formatDateString(d){
    const formatter = new Intl.DateTimeFormat('de-DE', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
    });
    return formatter.format(new Date(d));

  }

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

  const isOpen = event?.date && isOpenEvent(event.date);

  const handleCancel = async (e) => {
    e.stopPropagation();
    if (!event?._id) return;
    try {
      setLoading(true);
      await axios.post(`/api/events/${event._id}/cancel`);
      setOpen(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      onClick={() => isOpen && onClick()}
      className="relative w-full rounded-3xl overflow-hidden shadow-xl cursor-pointer h-[400px] lg:h-[600px]"
      style={{
        backgroundImage: `url(${event.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full p-6">
        <motion.div
          className="space-y-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <p className="text-xs uppercase tracking-wide text-pink-400 font-bold bg-black/50 w-max p-2 rounded-lg">
            {event.tagline}
          </p>
          <h2 className="text-white text-2xl font-bold leading-snug">
            {event.city?.name}
          </h2>
        </motion.div>

        <motion.div
          className="mt-4 backdrop-blur-sm bg-white/10 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <p className="text-sm text-white/90 mb-3">{event.description}</p>
          <div className="flex justify-between items-center text-white text-sm">
            <div className="opacity-90" dangerouslySetInnerHTML={{ __html: `${event.date && formatDateString(event.date)} &nbsp; ${event.group?.age_group ? `•&nbsp; Ages ${event.group?.age_group}` : ''}` }}>
              
            </div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <div className="flex gap-2">
                {isOpen && (
                  <Button
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClick();
                    }}
                    className="text-sm font-semibold px-4 py-1 bg-pink-600 hover:bg-pink-700 text-white transition-colors duration-300"
                  >
                    {t('matching_room.join_now')}
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={(e) => { e.stopPropagation(); setOpen(true); }}
                  className="text-sm font-semibold px-4 py-1 border-red-600 text-red-600 hover:bg-red-50"
                >
                  {t('dashboard.cancel')}
                </Button>

                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogContent className="sm:max-w-md bg-white">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">{t('matching_room.cancel_title', { defaultValue: 'Cancel Event?' })}</h3>
                      <p className="text-sm text-gray-600">
                        {t('matching_room.cancel_copy', { defaultValue: "Are you sure you want to cancel the event? You'll receive a voucher for a future event." })}
                      </p>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                          {t('dashboard.cancel')}
                        </Button>
                        <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleCancel} disabled={loading}>
                          {loading ? t('common.loading', { defaultValue: 'Processing...' }) : t('common.confirm', { defaultValue: 'Confirm' })}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EventCard;
