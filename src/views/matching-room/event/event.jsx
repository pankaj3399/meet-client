import React, { useContext, useState } from 'react'
import UserSwiper from './user-swiper'
import { UserSwiperContext, useTranslation, useParams, useAPI, Icon } from 'components/lib'

function Event() {
    const userSwiperContext = useContext(UserSwiperContext)
    const { t } = useTranslation();
    const [selectedImage, setSelectedImage] = useState(null)

    const handleImageClick = (src) => {
        setSelectedImage(src)
    }

    const closeModal = () => {
        setSelectedImage(null)
    }
    
    const { id } = useParams();
    const event = useAPI(`/api/events/${id}`);

    function formatDateString(d){
        try{
            return new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(d));
        }catch{ return ''; }
    }

    return <div>
        <div className="w-full flex flex-col items-center pb-[60px]">
            <h1 className="text-3xl font-semibold text-center my-6">
                {t('matching_room.all_participants', { defaultValue: 'Alle Teilnehmer aus' })} {" "}
                <span className="text-pink-600">{event?.data?.city?.name}</span> {" "}
                {t('matching_room.from', { defaultValue: 'vom' })} {" "}
                <span className="text-pink-600">{formatDateString(event?.data?.date)}</span>
            </h1>

            <div className="relative w-full max-w-5xl rounded-3xl bg-white border border-slate-200 p-4 lg:p-8 flex justify-center items-center overflow-hidden">
                {/* faint background icons */}
                <Icon name="x" size={280} className="absolute left-12 top-1/2 -translate-y-1/2 text-slate-300 opacity-20" />
                <Icon name="heart" size={320} className="absolute right-6 bottom-6 text-slate-300 opacity-20" />

                <div className="relative z-10">
                    <UserSwiper />
                </div>
            </div>
        </div>
        {/* Modal for enlarged image */}
        {selectedImage && (
            <div
            onClick={closeModal}
            className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center"
            >
            <img
                src={selectedImage}
                alt="Enlarged"
                className="max-w-full max-h-[90vh] rounded-lg shadow-xl"
            />
            <button
                onClick={closeModal}
                className="absolute top-6 right-6 text-white text-3xl font-bold"
            >
                &times;
            </button>
            </div>
        )}
    </div>
}

export default Event
