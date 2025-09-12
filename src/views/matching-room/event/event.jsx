import React, { useContext, useState } from 'react'
import UserSwiper from './user-swiper'
import { UserSwiperContext, useTranslation, useLocation, useAPI } from 'components/lib'

function Event() {
    const userSwiperContext = useContext(UserSwiperContext)
    const location = useLocation();
    const { t } = useTranslation();
    const parts = location.pathname.split('/');
    const [selectedImage, setSelectedImage] = useState(null)

    const event = useAPI(`/api/events/${parts[2]}`);

    const handleImageClick = (src) => {
        setSelectedImage(src)
    }

    const closeModal = () => {
        setSelectedImage(null)
    }

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
    
    return <div>
        <div className="flex gap-8 lg:gap-4 w-full flex-col lg:flex-row pb-[100px] lg:pb-0">
            <div className="flex-[60%] p-4 lg:p-8 lg:my-5">
                <h1 className="text-3xl lg:text-4xl font-light tracking-tight mb-5 mx-4 lg:mx-auto lg:max-w-[400px] text-center lg:mb-10">
                    {t('matching_room.all_participants')} <span className="text-pink-600 font-bold">{event?.data?.city?.name}</span> {t('matching_room.from')} <span className="text-pink-600 font-bold">{event?.data?.date && formatDateString(event.data.date)}</span>
                </h1>
                <UserSwiper />
            </div>
            {userSwiperContext?.activeUser && (
                <div className="w-full lg:block lg:w-[300px] p-6 bg-white shadow-lg border-0 rounded-3xl max-w-5xl mx-auto lg:min-h-[100vh]">
                    <div className="space-y-6">
                        {/* About Me Section */}
                        <div className="mt-8">
                        <h3 className="text-2xl font-semibold text-gray-800">{t('account.profile.profile.form.description.label')}</h3>
                        <p className="text-gray-600 mt-2">{userSwiperContext?.activeUser?.description}</p>
                        </div>

                        {/* Interests Section */}
                        {userSwiperContext?.activeUser?.interests?.length > 0 && (
                        <div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">{t('account.profile.profile.form.interests.label')}</h4>
                            <div className="flex flex-wrap gap-2">
                            {userSwiperContext?.activeUser?.interests.map((interest, index) => (
                                <span
                                key={index}
                                className="text-pink-600 border-pink-300 bg-pink-50 border rounded-full px-4 py-1 text-sm"
                                >
                                {interest}
                                </span>
                            ))}
                            </div>
                        </div>
                        )}

                        {/* Looking For Section */}
                        {userSwiperContext?.activeUser?.looking_for?.length > 0 && (
                        <div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">{t('account.profile.profile.form.looking_for.label')}</h4>
                            <p className="text-gray-700">{typeof userSwiperContext?.activeUser?.looking_for === 'string' ? userSwiperContext?.activeUser?.looking_for : userSwiperContext?.activeUser?.looking_for.join(", ")}</p>
                        </div>
                        )}

                        {/* Gallery Section */}
                        {userSwiperContext?.activeUser?.images.length > 1 && (
                        <div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">{t('account.profile.gallery')}</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                            {userSwiperContext?.activeUser?.images.slice(1).map((photo, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={photo}
                                        onClick={() => handleImageClick(photo)}
                                        alt={`Gallery ${index}`}
                                        className="rounded-xl object-cover h-40 w-full cursor-pointer hover:scale-105 transition-transform duration-300 shadow-md"
                                    />
                                </div>
                            ))}
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            )}
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
