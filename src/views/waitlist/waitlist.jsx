import React from 'react'

function Waitlist({ t }) {
  return (
    <div className='flex justify-center items-center min-h-screen text-center text-xl'>
        {t('waitlist.content')}
        <br/>
        {t('waitlist.content2')}
    </div>
  )
}

export default Waitlist
