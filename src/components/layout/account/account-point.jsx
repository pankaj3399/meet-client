import { Button } from "components/shadcn/button"
import { Avatar, AvatarFallback, AvatarImage } from "components/shadcn/avatar"
import { User, useNavigate, useTranslation } from 'components/lib';

export const SidebarProfileCard = ({ user }) => {
  const router = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="w-full p-2 flex flex-col items-start space-y-2">
      {/* Coin Balance */}
      {/* <div className="bg-pink-300 text-white rounded-lg w-full px-4 py-3 flex justify-between items-start">
        <div>
          <div className="text-sm">{t('account.coins.your_balance')}</div>
          <div className="text-lg font-bold">{user?.coins} {t('account.coins.coins')}</div>
        </div>
        <Button variant="link" className="text-white text-xs p-0 underline items-end" onClick={() => router(`/account/billing`)} >
        {t('account.coins.buy_now')}
        </Button>
      </div> */}
        {/* mini wallet card */}
        <div className='w-full'>
          <div className='rounded-2xl p-4 text-white shadow-md relative overflow-hidden bg-gradient-to-br from-pink-500 via-rose-500 to-red-500'>
            <div className='text-[14px] font-medium'>{t('dashboard.your_balance')}</div>
            <div className='mt-1 flex items-center gap-2 text-xl lg:text-[45px] font-extrabold'>
              <span>{user?.coins} {t('account.coins.coins')}</span>
              <span> ♥</span>
            </div>
            <button onClick={() => navigate('/account/billing?topup=1')} className='mt-3 w-full h-8 rounded-[14px] bg-white text-pink-600 text-sm font-semibold hover:bg-white/90 transition-colors lg:mt-6'>
              {t('dashboard.topup_now')}
            </button>
          </div>
        </div>

      {/* User Preview */}
      <div className="flex items-center space-x-2">
        <User />
        {/* <Avatar className="h-12 w-12">
          <AvatarImage src={user?.photos?.[0]} alt={user?.first_name} />
          <AvatarFallback>{user?.first_name?.[0] ?? "U"}</AvatarFallback>
        </Avatar> */}
        <div className="flex gap-0 flex-col">
          <div className="font-bold text-lg m-0 p-0">{user?.first_name}</div>
          <button 
            className="text-xs text-blue-500 hover:underline hover:text-blue-400 text-left m-0"
            onClick={() => router(`/account/profile`)}
          >{t('account.coins.edit_profile')}</button>
        </div>
      </div>
    </div>
  )
}
