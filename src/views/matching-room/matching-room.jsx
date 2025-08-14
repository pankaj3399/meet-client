import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import EventsGrid from './events-grid';
import { AuthContext, Icon } from 'components/lib';

function MatchingRoom() {
  const { t } = useTranslation();
  const auth = useContext(AuthContext);
  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-2">
          {t('dashboard.hey', 'Hey')} <span className="text-pink-600">{auth?.user?.name}</span>, {t('matching_room.dont_miss', 'verpasse diese Events nicht!')}
        </h1>

        {/* search pill */}
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-pink-100 text-pink-600">
            <Icon name="search" size={16} />
          </span>
          <button className="px-3 py-1 text-xs rounded-md bg-pink-100 text-pink-600 font-medium">{t('common.search', { defaultValue: 'Suchen' })}</button>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200 p-2">
          <EventsGrid />
        </div>
      </div>
    </div>
  );
}

export default MatchingRoom