/***
*
*   DASHBOARD
*   Template dashboard example demonstrating various components inside a view.
*
**********/

import { useContext, useEffect, useMemo, useState } from 'react';
import { ViewContext, Card, Stat, Chart, Table, Grid, Row, Animate, Feedback, useAPI, AuthContext, Icon, useNavigate } from 'components/lib';
import { Button } from 'components/shadcn/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'components/shadcn/dialog';
import DynamicBookingForm from './form';
import axios from 'axios';

export function Dashboard({ t }){

  // context
  const viewContext = useContext(ViewContext);
  const authContext = useContext(AuthContext);
  const events = useAPI('/api/events');
  const upcomingPastEvents = useAPI('/api/events/dashboard');
  const user = useAPI('/api/user');
  const navigate = useNavigate();

  // Booking modal state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submiting, setSubmiting] = useState(false);

  // Form data
  const [mainUser, setMainUser] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    email: '',
    password: '',
    looking_for: '',
    relationship_goal: '',
    children: '',
    kind_of_person: '',
    feel_around_new_people: '',
    prefer_spending_time: '',
    describe_you_better: '',
    describe_role_in_relationship: '',
  });

  const [friend, setFriend] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    email: '',
    looking_for: '',
    relationship_goal: '',
    children: '',
    kind_of_person: '',
    feel_around_new_people: '',
    prefer_spending_time: '',
    describe_you_better: '',
    describe_role_in_relationship: '',
  });

  const [addFriend, setAddFriend] = useState(false);

  // Form options
  const genders = [
    {label: t('dashboard.genders.male'), value: 'male'}, 
    {label: t('dashboard.genders.female'), value: 'female'}
  ];
  const lookingFor = [
    { value: 'male', label: t('account.profile.profile.gender.male') },
    { value: 'female', label: t('account.profile.profile.gender.female') },
    { value: 'both', label: t('account.profile.profile.gender.both') }
  ];
  const relationshipGoals = [
    { value: 'relationship', label: t('account.profile.profile.relationship_goal.relationship') },
    { value: 'friendship', label: t('account.profile.profile.relationship_goal.friendship') }
  ];
  const hasChildren = [
    { value: 'Yes', label: t('account.profile.profile.children.yes') },
    { value: 'No', label: t('account.profile.profile.children.no') }
  ];

  // show welcome message
  useEffect(() => {
    viewContext.notification({ 
      
      title: t('dashboard.message.title'),
      description: t('dashboard.message.text'),
    
    });
  }, []);

  const nextEvent = upcomingPastEvents?.data?.upcoming?.event;
  const invitedFriends = upcomingPastEvents?.data?.upcoming?.invited_friends;
  const currentEvent = upcomingPastEvents?.data?.current;
  const endEvent = upcomingPastEvents?.data?.end;

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

  // Modal handlers
  const openModal = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = (e) => {
    e?.preventDefault();
    setIsModalOpen(false);
    setSelectedEvent(null);
    setFriend({ first_name: '', last_name: '', date_of_birth: '', gender: '', email: '', looking_for: '',
    relationship_goal: '',
    children: '',
    kind_of_person: '',
    feel_around_new_people: '',
    prefer_spending_time: '',
    describe_you_better: '',
    describe_role_in_relationship: '', });
    setAddFriend(false);
  };

  const handleSubmit = async () => {
    setSubmiting(true);
    try {
      const { data: submitted } = await axios.post("/api/events/register", {
        mainUser,
        friend,
        id: selectedEvent._id
      });

      if (submitted) {
        navigate(`/event/${submitted.data.id}`);
      }
    } catch (err) {
      console.log(err);
      if (err.response?.data?.error) {
        viewContext.notification({
          description: err.response.data.error,
          variant: 'error'
        });
      } else {
        viewContext.handleError(err);
      }
    } finally {
      setSubmiting(false);
    }
  };

  // Populate user data
  useEffect(() => {
    function init() {
      setMainUser({
        first_name: user?.data?.first_name,
        last_name: user?.data?.last_name,
        date_of_birth: user?.data?.date_of_birth,
        gender: user?.data?.gender,
        email: user?.data?.email,
        looking_for: user?.data?.looking_for,
        relationship_goal: user?.data?.relationship_goal,
        children: user?.data?.children ? 'Yes' : 'No',
        kind_of_person: user?.data?.kind_of_person,
        feel_around_new_people: user?.data?.feel_around_new_people,
        prefer_spending_time: user?.data?.prefer_spending_time,
        describe_you_better: user?.data?.describe_you_better,
        describe_role_in_relationship: user?.data?.describe_role_in_relationship,
      });
    }
    const timer = setTimeout(() => {
      init();
    }, 30);
    return () => clearTimeout(timer);
  }, [user]);

  return (
    <Animate type='pop'>
      <div className="space-y-8 p-4 lg:p-12">
        <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">
          {t('dashboard.hey', 'Hey')} <span className="text-pink-600">{authContext?.user?.name}</span> <span role="img" aria-label="wave">👋</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Countdown + details card */}
          {
            nextEvent &&
            <div className="rounded-2xl bg-white shadow-md border border-slate-200 p-6">
              <div className="grid grid-cols-[auto_1px_1fr] gap-6 items-center h-full justify-center">
                {/* Left side */}
                <div className="flex flex-col items-center justify-center lg:px-8">
                  <div className="text-6xl lg:text-[100px] font-extrabold text-pink-600">
                    {daysUntil ?? '—'}
                  </div>
                  <div className="text-sm text-slate-600 mt-2 font-medium">
                    {t('dashboard.days_until_event', 'Tage bis zum Event')}
                  </div>
                </div>

                {/* Divider */}
                <div className="w-px h-full bg-slate-200" />

                {/* Right side */}
                <div className="flex flex-col gap-4 lg:gap-7 lg:px-8">
                  <div className="flex items-center gap-3 lg:gap-4 text-sm text-slate-900">
                    <img
                      src="/assets/icons/calendar.svg"
                      alt="calendar"
                      className="w-4 h-4 lg:w-6 lg:h-6 text-pink-600"
                    />
                    <span className='font-medium'>{formatDateString(nextEvent?.date)}</span>
                  </div>
                  <div className="flex items-center gap-3 lg:gap-4 text-sm text-slate-900">
                    <img
                      src="/assets/icons/map.svg"
                      alt="map"
                      className="w-4 h-4 lg:w-6 lg:h-6 text-pink-600"
                    />
                    <span className='font-medium'>{nextEvent?.city?.name || nextEvent?.location || '—'}</span>
                  </div>
                  <div className="flex items-center gap-3 lg:gap-4 text-sm text-slate-900">
                    <img
                      src="/assets/icons/partner.svg"
                      alt="partner"
                      className="w-4 h-4 lg:w-6 lg:h-6 text-pink-600"
                    />
                    <span className='font-medium'>
                      {invitedFriends?.length ? (invitedFriends?.[0]?.first_name ? `${invitedFriends?.[0]?.first_name} ${invitedFriends?.[0]?.last_name}` : invitedFriends?.[0]?.name)
                        : t('dashboard.no_partner')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          }

          {/* Wallet gradient card */}
          <div className="rounded-2xl p-6 text-white shadow-[0_4px_12px_#FE367866] relative overflow-hidden bg-gradient-to-br from-pink-500 via-rose-500 to-red-500">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="text-sm opacity-90">{t('dashboard.your_balance', 'Your balance')}</div>
            <div className="flex gap-2 lg:gap-4 justify-between">
              <div className="mt-2 flex items-center gap-2 text-4xl lg:text-[45px] font-extrabold">
                <span>{authContext?.user?.accounts?.[0]?.virtual_currency ?? 0}</span>
                <span>♥</span>
              </div>
              <div className="mt-3 text-[14px] opacity-90 max-w-[150px] lg:text-right">
                {t('dashboard.balance_helper', 'Löse deine Herzen gegen wertvolle Vorteile ein.')}
              </div>
            </div>
            <div className="mt-5">
              <button 
                className="w-full h-9 rounded-full bg-white text-pink-600 text-sm font-semibold hover:bg-white/90 transition-colors"
                onClick={() => navigate('/account/billing?topup=1')}
              >
                {t('dashboard.topup_now', 'Top up now')}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {
            currentEvent?.map((dt, i) => {
              return <div
            className="col-span-1"
            key={i}
          >
            <div className="relative rounded-2xl p-6 md:p-10 bg-gradient-to-r from-[#FE3678] to-red-500 text-white flex flex-col md:flex-row items-start md:items-center justify-between shadow-lg gap-4 lg:gap-8">
              {/* Left content */}
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold leading-snug">
                  {t('dashboard.current_events.title')}
                </h2>
                <p className="mt-3 text-white/80 text-sm md:text-base lg:mt-8">
                  {t('dashboard.current_events.subtitle')} {dt?.city?.name || dt?.location || '—'}.
                </p>
              </div>

              {/* Right content */}
              <div className="flex flex-col items-center lg:items-end mt-6 md:mt-0 gap-4 w-full">
                <img
                  src="/assets/icons/door.svg"
                  alt="door"
                  className="w-[40px] h-[40px] lg:w-[68px] lg:h-[68px] text-pink-600"
                />
                <Button
                  variant="outline"
                  className="rounded-full bg-white text-black hover:bg-gray-100 transition lg:mt-8"
                  onClick={() => navigate(`/matching-room/${dt._id}`)}
                >
                  {t('dashboard.current_events.btn')}
                </Button>
              </div>
            </div>
          </div>
            })
          }
          
          {
            endEvent > 0 && <div
            className="col-span-1"
          >
            <div className="relative rounded-2xl p-6 md:p-10 bg-gradient-to-r from-[#FE3678] to-red-500 text-white flex flex-col md:flex-row items-start md:items-center justify-between shadow-lg gap-4 lg:gap-8">
              {/* Left content */}
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold leading-snug">
                  {t('dashboard.end_events.title')}
                </h2>
                <p className="mt-3 text-white/80 text-sm md:text-base lg:mt-8 lg:max-w-[300px]">
                  {t('dashboard.end_events.subtitle')}
                </p>
              </div>

              {/* Right content */}
              <div className="flex flex-col items-center lg:items-end mt-6 md:mt-0 gap-4 w-full">
                <img
                  src="/assets/icons/hand-wave.svg"
                  alt="hand-wave"
                  className="w-[40px] h-[40px] lg:w-[68px] lg:h-[68px] text-pink-600"
                />
                <a
                  className="border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50 rounded-full text-black h-10 px-4 py-2 transition lg:mt-8"
                  href="#events"
                >
                  {t('dashboard.end_events.btn')}
                </a>
              </div>
            </div>
          </div>
          }
        </div>

      {/* More events list */}
      <section>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8">
          {/* Header inside card */}
          <div className="mb-6 flex flex-col" id="events">
            <h2 className="text-[25px] font-medium text-slate-900">
              {t('dashboard.more_events_head', 'Weitere Events,')}
            </h2>
            <p className="text-[25px] font-light text-slate-600">
              {t('dashboard.more_events_sub', 'die du dir nicht entgehen lassen solltest')}
            </p>
          </div>

          {/* Events list */}
          <div className="divide-y">
            {events?.data?.map((ev, idx) => (
              <div key={idx} className="flex items-center justify-between py-6 gap-6 flex-col lg:flex-row">
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
                <Button
                  className={
                    ev.is_registered
                      ? "bg-gray-400 text-white cursor-not-allowed rounded-[14px] px-6 py-2 text-sm"
                      : "bg-black text-white hover:bg-slate-800 rounded-[14px] px-6 py-2 text-sm"
                  }
                  onClick={() => !ev.is_registered && openModal(ev)}
                  disabled={ev.is_registered}
                >
                  {ev.is_registered
                    ? t('matching_room.already_booked', 'Bereits gebucht')
                    : t('dashboard.book_participation', 'Teilnahme buchen')}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

        {/* Register Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-3xl bg-white">
            <DialogHeader>
              <DialogTitle>{t('dashboard.book_event')}: {selectedEvent?.tagline}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <DynamicBookingForm
                handleSubmit={handleSubmit}
                mainUser={mainUser}
                setMainUser={setMainUser}
                friend={friend}
                setFriend={setFriend}
                addFriend={addFriend}
                setAddFriend={setAddFriend}
                genders={genders}
                closeModal={closeModal}
                lookingFor={lookingFor}
                relationshipGoals={relationshipGoals}
                hasChildren={hasChildren}
              />
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Animate>
  );
}

