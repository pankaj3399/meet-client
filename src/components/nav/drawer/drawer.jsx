/***
*
*   DRAWER NAV
*   Primary mobile navigation used inside the main app.
*
*   DOCS
*   https://docs.usegravity.app/gravity-web/components/nav
*
*   PROPS
*   items:[{ label: string, link: string, icon: string }] (array, required)
*
**********/

import React, { useContext } from "react";
import { NavLink } from 'react-router-dom';
import { Sheet, SheetClose, Button, Icon, Logo, cn, SidebarProfileCard, AuthContext, useLocation } from 'components/lib';

export function DrawerNav({ items }){
  const authContext = useContext(AuthContext);

  const Trigger = <Button size='icon' variant='ghost' iconSize={ 22 } icon='menu' className='fixed top-[0.7em] z-50 left-2 sm:hidden bg-white'/>
  
  const location = useLocation();

  return (
    <Sheet side='left' trigger={ Trigger } accessibleTitle='Menu'>

      <Logo mark className='inline-block h-auto w-full mb-6' color='dark'/>

      <nav className='flex flex-col text-lg font-medium gap-y-3 pl-[5px] sm:hidden'>
        { items.length && 
          items.map(item => {
            const isActiveUrl = item.link && location.pathname.startsWith(item.link);
            
            return (
              <div className='[&>a]:flex [&>a]:items-center [&>a]:gap-x-3 text-muted-foreground hover:text-foreground dark:text-slate-50' key={ item.label }>

                { item.link ?
                  <SheetClose asChild>
                    <NavLink 
                      key={ item.label } 
                      to={ item.link } 
                      className={({ isActive }) => cn('flex items-center gap-3 rounded-xl font-medium text-sm hover:text-pink-600 hover:font-bold transition-colors md:w-full py-2', { ['bg-pink-50 text-pink-600 font-semibold']: isActive })}>
                        {item.icon ? <Icon name={ item.icon } size={ 18 } /> : <img src={item.img} className={`w-[14px] h-[14px] brightness-0`} style={isActiveUrl? {filter: 'brightness(0) saturate(100%) invert(40%) sepia(45%) saturate(6505%) hue-rotate(320deg) brightness(101%) contrast(99%)'} : {}}/>} <span className={cn("text-sm text-black", isActiveUrl && 'text-pink-600')}>{item.label}</span> {(item.link.includes('/inbox') && authContext?.unreadCount) ? <span><span className="font-bold text-green-500">
                        ({authContext?.unreadCount})
                        </span></span> : null}

                    </NavLink>
                  </SheetClose> :
                  <></>
                  // <Button 
                  //   key={ item.label } 
                  //   text={ item.label }
                  //   action={ item.action }  
                  //   icon={ item.icon }
                  //   color='primary'
                  //   iconColor='white'
                  //   size='full'
                  // /> 
                }

              </div> 
            )
          }) 
        }
      </nav>
      <div className="mt-auto absolute bottom-4 w-[85%]">
        <SidebarProfileCard
          user={{
            id: '',
            first_name:  authContext?.user?.name,
            photos: [],
            coins: authContext?.user?.accounts?.[0]?.virtual_currency
          }}
        />
      </div>
    </Sheet>
  )
}