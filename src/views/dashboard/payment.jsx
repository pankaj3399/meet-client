/***
*
*   SIGN UP STEP 2
*   Signup form for account owners
*   Step 1: create account
*   Step 2: verify email address
*   Step 3: select plan
*
**********/

import { useContext, useState, useEffect } from 'react';
import { Animate, AuthContext, Button, Image, PaymentForm, useAPI, Link, Event, useNavigate, Logo, Icon, ViewContext, FloatingModal, useLocation, Card, cn, useSearchParams } from 'components/lib';
import Axios from 'axios';
// import CountUp from "react-countup";

export function Payment(props){
  const viewContext = useContext(ViewContext);
  const context = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const path = location?.pathname?.split('/');
  const id = path[2];
  console.log(context?.user?.accounts?.[0]?.email);

  const [searchParams] = useSearchParams();
  const sourceParam = searchParams.get('source');
  const [isCheckingSlot, setIsCheckingSlot] = useState(true);
  
  // state
  const [period, setPeriod] = useState('month');
  const [directDebit, setDirectDebit] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [customBtnClick, setCustomBtnClick] = useState(0);
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [couponData, setCouponData] = useState(null)
  const [pricePreview, setPricePreview] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clicked, setClicked] = useState(false);

  const [modal, setModal] = useState({
    title: props.t('auth.signup.payment.checkout.title'),
    subtitle: props.t('auth.signup.payment.checkout.subtitle'),
    info: 'cup'
  })

  const closeModal = () => setIsModalOpen(false);

  // fetch
  const fetch = useAPI(`/api/transaction/${id}`);

  // useEffect(() => {

  //   // set first plan as default
  //   setSelectedPlan(fetch.data?.plans?.[0]);
  // }, [fetch.data]);

  // if (!fetch.data?.plans)
  //   return null;

  useEffect(()=>{
    if(sourceParam == 'mail'){
      const checkSlot = async () => {
        try {
          const res = await Axios.get(`/api/event/payment/check-for-slot/${id}`);
          if(res.data?.data?.status == 'waitlist'){
              viewContext.notification({
                title: props.t('waitlist.title'),
                description: props.t('waitlist.description'),
                variant: 'error'
              })
              navigate('/dashboard')
          }
          else if(res.data?.data?.status == 'paid'){
              viewContext.notification({
                title: props.t('register_event.already_registered'),
                variant: 'success'
              })
              navigate('/dashboard')
          }
        } catch (error) {
          viewContext.handleError(error);
        } finally {
          setIsCheckingSlot(false);
        }
      }
      checkSlot();
    }
    else{
      setIsCheckingSlot(false);
    }
  }, [sourceParam])

  const buttonClick = async () => {
    setLoading(true);
    try {
      // Validate coupon for this event transaction
      const res = await Axios.post(`/api/event/${id}/validate-coupon`, { code: coupon, transaction: id });
      setCouponData(res.data.data?.coupon);
      setPricePreview(res.data.data?.price);
      setModal({
        title: props.t('auth.signup.payment.coupon.success.title'),
        subtitle: props.t('auth.signup.payment.coupon.success.subtitle'),
        info: 'success'
      })

      setIsModalOpen(true)

      setLoading(false);
      setRedeemed(true)
    } catch (err) {
      const serverError = err.response?.data?.error || err.response?.data?.message;
      console.log(serverError, 'coupon error');
      if(serverError === 'Invalid coupon'){
        setModal({
          title: props.t('auth.signup.payment.coupon.error.title'),
          subtitle: props.t('auth.signup.payment.coupon.error.subtitle'),
          info: 'error'
        })
  
        setIsModalOpen(true)
      } else {
        viewContext.handleError(err);
      }
      setLoading(false);
    }
  }

  if (isCheckingSlot) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ height: '100vh' }}>
        <div className="animate-spin rounded-full h-20 w-20 border border-dashed border-t-4 border-pink-500"></div>
        <p className="mt-4 text-gray-600">{props.t('waitlist.checking')}</p>
      </div>
    )
  }
  
  return (
    <Animate type='pop'>
      <Card restrictWidth className={cn(props.className, "p-4 lg:p-10 !max-w-full bg-background")}>
        <div className='flex flex-col w-full items-start md:h-[100vh] md:max-h-[100vh] overflow-auto max-w-[600px]'>

          <section className='mt-8 md:mt-0 w-full md:p-12s bg-background md:h-[100vh] md:max-h-[100vh] overflow-auto'>

            {/* Coupon Code Section */}
            <div className="mt-6 p-8 bg-white rounded-lg">
              <h3 className="text-lg lg:text-xxl font-semibold text-gray-600">{props.t('account.payment.transaction.title')}</h3>
              <h3 className="text-xl lg:text-2xl font-bold mb-6 lg:mb-8">{props.t('account.payment.transaction.description_event', {
                event: fetch?.data?.event_id?.city?.name
              })}  {props.t('account.payment.transaction.for')} <span className="text-pink-500">€ {pricePreview?.final || fetch.data?.amount}</span></h3>
              {pricePreview && (
                <p className="text-sm text-gray-600">{props.t('auth.signup.payment.coupon.applied', { defaultValue: 'Coupon applied.' })} {props.t('auth.signup.payment.coupon.original', { defaultValue: 'Original:' })} € {pricePreview.original} • {props.t('auth.signup.payment.coupon.discount', { defaultValue: 'Discount:' })} € {pricePreview.discount}</p>
              )}

              <h3 className="text-lg lg:text-xl font-bold pb-4">{props.t('auth.signup.payment.coupon.title')}</h3>
              <p className="text-sm text-gray-500 font-medium">{props.t('auth.signup.payment.coupon.description')}</p>
              <div className="mt-2 flex">
                <input
                  type="text"
                  className="flex-1 border px-4 py-2 rounded-l-md rounded-r-none"
                  placeholder={props.t('auth.signup.payment.coupon.placeholder')}
                  onChange={(e) => (setCoupon(e.target.value), setCouponData(null))}
                  disabled={redeemed}
                  readOnly={redeemed}
                />
                 <button className="bg-black text-white px-4 py-2 rounded-r-md" onClick={(e) => {
                  e.preventDefault();
                  !loading && (redeemed ? setRedeemed(false) : buttonClick())
                }}>
                  {redeemed ? props.t('auth.signup.payment.coupon.change_code') : props.t('auth.signup.payment.coupon.redeem')}
                </button>
              </div>
            </div>

            <div className="mt-6 p-8 bg-white rounded-lg">
            {/* Payment Method Tabs */}
              <div className="w-full flex justify-center items-center">
                <div className="flex my-4 space-x-2 bg-gray-100 p-1 rounded-lg w-fit ">
                  <button className={`px-4 py-2 text-sm font-semibold ${!directDebit && 'bg-white shadow !font-bold font-grostek-bold'} rounded-md`} onClick={() => setDirectDebit(false)}>{props.t('auth.signup.payment.payment.method.credit_card')}</button>
                  <button className={`px-4 py-2 text-sm font-semibold ${directDebit && 'bg-white shadow !font-bold font-grostek-bold'} rounded-md `} onClick={() => setDirectDebit(true)}>{props.t('auth.signup.payment.payment.method.sepa')}</button>
                </div>
              </div>

            {/* Payment Form */}
            <PaymentForm
              inputs={{
                // plan: {
                //   type: 'hidden',
                //   value: selectedPlan?.id,
                // },
                ...!directDebit && { credit_card_name: {
                  label: props.t('account.billing.card.form.name_on_card'),
                  type: 'text',
                  required: true,
                  labelClassname: 'font-normal',
                },
                token: {
                  label: props.t('auth.signup.payment.form.token.label'),
                  type: 'creditcard',
                  required: true,
                },
              },
                ...directDebit && 
                { 
                  account_holder_name: {
                    label: props.t('auth.signup.payment.form.account_holder_name.label'),
                    type: 'text',
                    required: true,
                  },
                  iban: {
                    label: props.t('auth.signup.payment.form.iban.label'),
                    type: 'iban',
                    required: true,
                  },
                  
                },
                coupon: {
                  type: 'hidden',
                  label: 'Coupon',
                  required: false,
                  value: coupon
                },
              }}
              sepaForm={directDebit}
              isEmail={context?.user?.accounts?.[0]?.email}
              url={`/api/event/payment/${id}`}
              method='POST'
              customDisabled={() => setClicked(false)}
              callback={ res => {
                console.log(res);
                // save the plan to context, then redirect
                // Event('selected_plan', { plan: res.data.plan });
                // context.update({ plan: res.data.plan, subscription: res.data.subscription });
                
                navigate('/dashboard');
                
              }}
              customBtnTrigger={customBtnClick}
              paymentId={id}
            />

          </div>

            {/* Pay Button */}
            <button className={`mt-6 mb-28 w-full bg-black text-white py-3 rounded-md text-lg font-semibold flex items-center justify-center space-x-2 ${clicked && 'opacity-50'}`} onClick={(e) => {
              e.preventDefault();
              if(!clicked){
                setCustomBtnClick(prev => prev + 1);
                setClicked(true);
              }
            }}
            disabled={clicked}
            >
              <span>{props.t('auth.signup.payment.checkout.pay_now')}</span> <span>→</span>
            </button>
          </section>
        </div>
        {
          isModalOpen &&
          <FloatingModal
            isOpen={isModalOpen}
            onClose={closeModal}
            title={modal.title}
            description={modal.subtitle}
            info={modal.info}
          />
        }
      </Card>
    </Animate>
  );
}
