import { Undo2, X, Star, Heart, LucideHeart } from 'lucide-react'
import React, { useMemo, useState, useRef, useContext, useEffect } from 'react';
import TinderCard from 'react-tinder-card';
import { UserSwiperContext, useTranslation, useAPI, useLocation, ViewContext, AuthContext } from 'components/lib';
import Axios from 'axios';

 const mainPhoto = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARMAAAC3CAMAAAAGjUrGAAAAMFBMVEXx8/XCy9K/yND09vfw8vTP1tzp7O/i5ure4+fO1dvJ0dfT2d/EzNPt7/Lb4OXo6+4FeM7UAAAFL0lEQVR4nO2c24KrIAxFLdha7///t0dxOlWDSiAKztnrbR4G6SoJBKHZA6zJYncgQeCEAicUOKHACQVOKHBCgRMKnFDghAInFDihwAkFTihwQoETCpxQ4IQCJxQ4ocAJBU4ocEKBEwqcUOCEAicUOKHACQVOKHBCgRMKnFDghAInFDihwAkFTihwQoETCpxQ4IQCJxQ4ocAJBU4ot3Oi1KMq64FnWTVq+EueWzlRquqKVn/J+/ezEfdyHydKPYtc62yF1m1Xymq5ixPVdDnx8eslf1eCVu7hRFXFppAfLW39kNJyByeqOTJirGTvRsbKDZyozsHIpKUQsZK8E1Vu55GTrKTuRL0ZRoyVLviZaTtRVctUMuaVOnCoJO1E1WwjxsorbGZO2Qk7br5WuhApKTvpfZWMy5WAoZKuk6b1NhI4VJJ10uRBSsas0ng+OlUnVaARw9NvqCTqRERJpt9eUtJ0IqPEN36SdNIIKRnIPeafFJ0Ep9c5mr+qTdFJ2CRMpLAn5fScqJeokrFWZkoRdaImwtpw2T9iSnnxuiDoRFXda6hK28JzWTA14ryBxKFlTT9iTlT1W57o3Lta96yED8krRieknCw/DDuEP1TnKBlgzMlCTtZDXr+8pIjOwitK5x7JOKFD3mukiE85ix45S5FxYll46prdiv8ekpsU19wv4kS9LV1ouQPlrPzKliIzTuw9YDYiVfgFSxFx8rR+wcyMomSX9HYpTjlFwonqrB3gBc/JyYQjRcRJYe8Ay4l9rMlLcVi8iTjp7Y/nOBHcMjngWEoi4+TUlcmKw9rnxHzCWMqeU/ltkB9JEZl3SusnYmwQn1fm2GgPeiOzZrM9WZfu/3/BNDznYATLOLENffep+JppeMZBMSZUF9N6ljFM7KF3qpTduBZyQj4W53XTiRsEm1L2dr2k9k9W9Rtjq2BrJj9Zyk7pI7bP9lw8kfH+4KIFLGF77Sa3R90Un0POvHNCcYzsLVMk9+2buni1bd9xjMSJHMPmjCz7zov/fidW5GQ7OS/2e8BoRrLtrBfXScTIMVLsk09cJxEjZ8I6+cR1EmG1tsRaDsZ0EjlyDL0leuxOpulD4JTALtfXORRbnqVO1LDOePdtpoclWPsqulL+wt0P0SNnxFKrrp2opmuXl+5OuHA3PSmByDGQ9ezSydYdM+ELd4YUIsdANnoWTva2RSUv3JlnJRE5I2RbY+6kee1+dTrrhC7cPTZeMUdivZnydaIc3tdqqWuI6USOYZlSfp0oxzVlJxNByUSOYZlSPk6cDzqEXy17JDTn/LBMKRlTSRZ4X2giep2zZnEwZHLiGjifFt6BTtKKHMMspUxO2BkvDzoDm1jkGGa7bsaJx0t9XfgrOfuMlhezwsc48RrKufvhyiXXHatg8T2Zkm0eHzluxO8W4pXHKljkXycBt3h9blFdeqyCx2fPOguLbn6qTWsBu+Czxs/CopsdP4kmkx+mcZ8FRrfuWUqSTSYT005keDucW4iXnzRhMg17iYacC6A0VyZzzIQs0pBrUrn22JoXY4Us0pDjaZMzb+dIMX6/Qi0dHSU0XHySz48heqSaOs60vsvlq2mtpzj9OCh/Trgjew7afgLar63d6ec2SmTZm37+UyV7048K+Gmkm7O10A/8aaSbY7sEr8rYvYoNnX4Sr3EuYJVpVc35Ccu/innZbryMJ1n4v9f4N9FZ39XPZ931GYzMGH9VPHYfAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADp8Q9+nG9anuOrfAAAAABJRU5ErkJggg==";

const Advanced = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const parts = location.pathname.split('/');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastDirection, setLastDirection] = useState(null);
  const [lastSwipedUser, setLastSwipedUser] = useState(null);
  const userSwiperContext = useContext(UserSwiperContext)
  const viewContext = useContext(ViewContext);
  const context = useContext(AuthContext);
  const [superlikedUsers, setSuperlikedUsers] = useState([]);
  const [lastSuperliked, setLastSuperliked] = useState(null);

  const currentIndexRef = useRef(currentIndex);

  const users = useAPI(`/api/matching/participants/${parts[2]}`);

  const childRefs = useRef([]);

  const updateCurrentIndex = (val) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  const canSwipe = currentIndex >= 0;
  const canGoBack = lastSwipedUser !== null;

  const mergedUsers = useMemo(() => {
    if (!users?.data) return [];
    const filtered = users.data.filter(
      u => !superlikedUsers.find(s => s._id === u._id)
    );
    return [...filtered, ...superlikedUsers]; // superlikers first
  }, [superlikedUsers, users?.data]);

  useEffect(() => {
    if (mergedUsers?.[currentIndex]) {
      userSwiperContext.setActiveUser(mergedUsers?.[currentIndex]);
    } else {
      userSwiperContext.setActiveUser(null);
    }
  }, [currentIndex, mergedUsers]);

  useEffect(() => {
  const fetchSuperlikes = async () => {
    const res = await Axios.get(`/api/matching/incoming-superlikes/${parts[2]}`);
    setSuperlikedUsers(res?.data?.data ? res?.data?.data?.map(dt => {
      return {
        ...dt,
        isPendingSuperlike: true
      }
    }) : []);
  };
  fetchSuperlikes();
}, []);

  useEffect(() => {
  if (mergedUsers?.length > 0) {
    const last = mergedUsers.length - 1;
    setCurrentIndex(last);
    currentIndexRef.current = last;
  }
}, [mergedUsers]);
  
  const swiped = async (direction, name, index, id) => {
    
    const isSuperliker = superlikedUsers.find(u => u._id === id);
    
    if (isSuperliker) {
      viewContext.dialog.open({
        title: t(`matching_room.confirm_superlike.form.title_${direction === 'right' ? 'confirm' : 'reject'}`),
        form: {
          inputs: {
            eventId: {
              type: 'hidden',
              value: parts[2]
            },
            superlikeFromId: {
              type: 'hidden',
              value: users.data?.[currentIndex]
            },
            confirm: {
              type: 'hidden',
              value: direction === 'right'
            }
          },
          buttonText: t(`matching_room.confirm_superlike.form.button${direction === 'right' ? '' : '_reject'}`),
          url: '/api/matching/superlike/confirm',
          method: 'POST'
        }
      }, () => {
        setLastDirection(direction);
        setLastSwipedUser({ user: users.data?.[index], index });
        updateCurrentIndex(index - 1);
      });
    } else {
      if(lastSuperliked !== id){
          try {
            const res = await Axios({
              method: 'POST',
              url: `/api/matching/swipe`,
              data: {
                targetId: id, eventId: parts[2], direction
              }
            });
            setLastDirection(direction);
            setLastSwipedUser({ user: users.data?.[index], index });
            updateCurrentIndex(index - 1);
          } catch (error) {
            console.log(error);
            
          }
      }
    }

  };
  
  const swipe = async (dir) => {
    const index = currentIndexRef.current;
    if (index >= 0 && childRefs.current[index]) {
      try {
        const res = await Axios({
          method: 'POST',
          url: `/api/matching/swipe`,
          data: {
            targetId: users.data?.[index]?._id, eventId: parts[2], direction: dir
          }
        });
        await childRefs.current[index].swipe(dir);
        setLastDirection(dir);
      } catch (error) {
        console.log(error);
      }
    }

  };

  const handleUndo = async () => {
    if (!lastSwipedUser) return;

    const { index } = lastSwipedUser;

    if (!childRefs.current[index]?.restoreCard) {
      console.warn('restoreCard not available for index:', index);
      return;
    }

    viewContext.dialog.open({
      title: t('matching_room.undo.form.title'),
      form: {
        inputs: {
          eventId: {
            type: 'hidden',
            value: parts[2]
          }
        },
        buttonText: t('matching_room.undo.form.button'),
        url: '/api/matching/swipe/undo',
        method: 'POST'
      }
    }, (form, res) => {

      // First restore the card visually
      childRefs.current[index].restoreCard();

      // Then update the index state
      updateCurrentIndex(index);
      setLastSwipedUser(null);

      const user = JSON.parse(localStorage.getItem('user'));

      if (user && Array.isArray(user.accounts) && user.accounts[0]) {
        const currentVC = user.accounts[0].virtual_currency || 0;
        const updatedVC = currentVC + (res.data?.data?.quantity || 0);

        context.update({
          accounts: [
            {
              ...user.accounts[0],
              virtual_currency: updatedVC
            }
          ]
        });
      }

    });

  };

  const handleSuperlike = async () => {
    if (currentIndex < 0) return;
    viewContext.dialog.open({
      title: t('matching_room.superlike.form.title'),
      form: {
        inputs: {
          eventId: {
            type: 'hidden',
            value: parts[2]
          },
          targetId: {
            type: 'hidden',
            value: users.data?.[currentIndex]?._id
          },
          direction: {
            type: 'hidden',
            value: 'superlike'
          }
        },
        buttonText: t('matching_room.superlike.form.button'),
        url: '/api/matching/swipe',
        method: 'POST'
      }
    }, async (form, res) => {
      
      setLastSuperliked(users.data?.[currentIndex]?._id)
      const user = JSON.parse(localStorage.getItem('user'));

      if (user && Array.isArray(user.accounts) && user.accounts[0]) {
        const currentVC = user.accounts[0].virtual_currency || 0;
        const updatedVC = currentVC + (res.data?.data?.quantity || 0);

        context.update({
          accounts: [
            {
              ...user.accounts[0],
              virtual_currency: updatedVC
            }
          ]
        });
      }

      await childRefs.current[currentIndex].swipe('right');
      setLastDirection('right');
      setCurrentIndex(currentIndex - 1);

    });
  };

  const handleConfirmSuperlike = async (confirm) => {
    const index = currentIndexRef.current;
    const direction = confirm ? 'right' : 'left';
    try {
      viewContext.dialog.open({
        title: t(`matching_room.confirm_superlike.form.title_${direction === 'right' ? 'confirm' : 'reject'}`),
        form: {
          inputs: {
            eventId: {
              type: 'hidden',
              value: parts[2]
            },
            superlikeFromId: {
              type: 'hidden',
              value: mergedUsers?.[currentIndex]?._id
            },
            confirm: {
              type: 'hidden',
              value: direction === 'right'
            }
          },
          buttonText: t(`matching_room.confirm_superlike.form.button${direction === 'right' ? '' : '_reject'}`),
          url: '/api/matching/superlike/confirm',
          method: 'POST'
        }
      }, async () => {
        setLastDirection(direction);
        setLastSwipedUser({ user: mergedUsers?.[currentIndex], index });
        updateCurrentIndex(index - 1);
        await childRefs.current[index].swipe(direction);
      });
    } catch (error) {
      console.log(error);
    }
  }

  function calculateAge(dateOfBirth) {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }

  return (
    <div className="w-full lg:min-h-[70vh] flex flex-col items-center justify-center mt-8 lg:mt-6">
      {
        (canSwipe && mergedUsers?.length > 0) &&
        <div className="relative w-full lg:w-full lg:max-w-[800px] h-[420px] lg:h-[600px]">
          {[...mergedUsers]?.map((user, index) => (
            <TinderCard
              ref={(el) => (childRefs.current[index] = el)}
              className="absolute w-full h-full"
              key={user._id}
              onSwipe={(dir) => swiped(dir, user.first_name, index, user._id)}
              preventSwipe={['up', 'down']}
            >
              <div
                style={{ zIndex: index === currentIndex ? 100 : index }}
                className={`relative bg-white rounded-xl w-full h-full overflow-hiddens flex flex-col cursor-grab transition-all duration-300 ease-in-out
                  ${user.isPendingSuperlike ? 'shadow-xl border-2 border-pink-500 ' : 'shadow-lg'}
                `}
              >
                {/* Background giant X and Heart */}
                <div className="absolute inset-0 flex justify-between items-center text-[200px] font-extrabold opacity-[0.05] select-none pointer-events-none">
                  <img
                      src="/assets/icons/reject.svg"
                      alt="reject"
                      className="w-[30%] lg:w-[40%] h-auto text-pink-600 brightness-50"
                  />
                  <img
                      src="/assets/icons/love.svg"
                      alt="love"
                      className="w-[30%]  lg:w-[40%] h-auto text-pink-600 brightness-50 lg:mr-[-10px]"
                    />
                </div>

                {/* Name Badge at top */}
                <div className="bg-gradient-to-r from-pink-500 to-red-500 absolute top-[-15px] left-1/2 -translate-x-1/2 z-20 flex items-center shadow-lg rounded-[14px] overflow-hidden">
                  {/* Left side: Name */}
                  <div className=" text-white px-5 py-2 text-sm font-semibold">
                    {user.first_name} {user.last_name?.charAt(0)}.
                  </div>
                  {/* Right side: Age */}
                  {user.date_of_birth && (
                    <div className="bg-white text-pink-500 px-5 py-2 text-sm font-bold ml-[-7px] rounded-l-[12px]">
                      {calculateAge(user.date_of_birth)}
                    </div>
                  )}
                </div>

                {/* Superlike Tag */}
                {user.isPendingSuperlike && (
                  <div className="absolute top-16 left-4 z-20 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 text-white text-sm font-semibold flex items-center gap-2 shadow-xl border border-white/30 backdrop-blur-sm animate-[pulseShadow_2s_infinite]">
                    <Star className="w-4 h-4 text-yellow-300 drop-shadow-sm" />
                    {t('matching_room.confirm_superlike.tag')}
                  </div>
                )}

                {/* User Image */}
                <img
                  src={user.avatar || mainPhoto}
                  alt={user.first_name}
                  className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[200px] lg:w-[340px] h-[340px] lg:h-[520px] object-cover rounded-xl pointer-events-none"
                />
              </div>
            </TinderCard>
          ))}
        </div>
      }

      {/* Controls */}
      {(canSwipe && mergedUsers?.length > 0) && (
        mergedUsers[currentIndex]?.isPendingSuperlike ? (
          <div className="flex gap-2 justify-center items-center mt-4 lg:mt-6 lg:gap-5">
            <button
              onClick={() => handleConfirmSuperlike(false)}
              className="bg-red-100 hover:bg-red-200 text-red-600 px-6 py-2 rounded-full shadow-lg text-sm font-medium"
            >
              {t('matching_room.confirm_superlike.no')}
            </button>
            <button
              onClick={() => handleConfirmSuperlike(true)}
              className="bg-green-100 hover:bg-green-200 text-green-600 px-6 py-2 rounded-full shadow-lg text-sm font-medium"
            >
              {t('matching_room.confirm_superlike.yes')}
            </button>
          </div>
        ) : (
          <div className="mt-4 lg:mt-6s flex justify-center gap-2 lg:gap-5 lg:absolute bottom-8">
            {
              (lastDirection === 'left' && !mergedUsers[currentIndex - 1]?.isPendingSuperlike) &&
              <button onClick={handleUndo} className="bg-yellow-100 hover:bg-yellow-200 text-yellow-600 p-4 rounded-full shadow-lg">
                <Undo2 className="w-6 h-6" />
              </button>
            }
            <button onClick={() => swipe('left')} className="bg-gradient-to-r hover:bg-red-200 from-[#000000] to-[#444444] p-4 rounded-full shadow-lg">
              {/* <X className="w-6 h-6" /> */}
              <img
                src="/assets/icons/x.svg"
                alt="x"
                className="w-4 h-4 lg:w-6 lg:h-6"
              />
            </button>
            <button onClick={handleSuperlike} className="bg-gradient-to-br hover:bg-blue-200 from-[#4A36FE] to-[#D200A1] p-4 rounded-full shadow-lg">
              {/* <Star className="w-6 h-6" /> */}
              <img
                src="/assets/icons/superlike.svg"
                alt="superlike"
                className="w-4 h-4 lg:w-6 lg:h-6"
              />
            </button>
            <button onClick={() => swipe('right')} className="bg-gradient-to-br hover:bg-green-200 from-[#FE3678] to-[#FE313F] p-4 rounded-full shadow-lg">
              {/* <Heart className="w-6 h-6" /> */}
              <img
                src="/assets/icons/heart.svg"
                alt="heart"
                className="w-4 h-4 lg:w-6 lg:h-6"
              />
            </button>
          </div>
        )
      )}

      {(!canSwipe || mergedUsers?.length < 1) && (
        <div className="flex flex-col items-center justify-center mt-8 space-y-4 p-6 bg-gray-50 rounded-3xl shadow-lg max-w-sm mx-auto">
          <div className="text-gray-400">
            <LucideHeart className="w-12 h-12 mb-4 animate-pulse text-pink-500" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-800">{t('matching_room.no_more_user')}</h3>
          <p className="text-gray-600 text-center">
            {t('matching_room.no_more_description')}
          </p>
        </div>
      )}
    </div>
  );
};

export default Advanced;
