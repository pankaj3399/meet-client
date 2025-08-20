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
import { Animate, AuthContext, Button, Image, PaymentForm, useAPI, Link, Event, useNavigate, Logo, Icon, ViewContext, FloatingModal, useLocation, Card, cn } from 'components/lib';
import Axios from 'axios';
// import CountUp from "react-countup";

export function Payment(props){
  const viewContext = useContext(ViewContext);
  const context = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const path = location?.pathname?.split('/');
  const id = path[3];
  
  // state
  const [directDebit, setDirectDebit] = useState(false);
  const [customBtnClick, setCustomBtnClick] = useState(0);
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [couponData, setCouponData] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clicked, setClicked] = useState(false);

  const [modal, setModal] = useState({
    title: props.t('account.payment.checkout.title'),
    subtitle: props.t('account.payment.checkout.subtitle'),
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

  const buttonClick = async () => {
    setLoading(true);
    try {
      let res = await Axios({
  
        method: 'POST',
        url: '/api/account/coupon',
        data: {
          coupon
        }
  
      });
      setCouponData(res.data.plan?.coupon?.coupon)
      setModal({
        title: props.t('account.payment.coupon.success.title'),
        subtitle: props.t('account.payment.coupon.success.subtitle'),
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
          title: props.t('account.payment.coupon.error.title'),
          subtitle: props.t('account.payment.coupon.error.subtitle'),
          info: 'error'
        })
  
        setIsModalOpen(true)
      } else {
        viewContext.handleError(err);
      }
      setLoading(false);
    }
  }
  
  return (
    <Animate type='pop'>
      <Card restrictWidth className={cn(props.className, "p-4 lg:p-10 !max-w-full bg-background")}> 
        <div className='flex flex-col w-full items-start max-w-[880px]'>

          <section className='mt-2 w-full'>
            <h1 className="text-3xl font-semibold mb-3">Hey <span className='text-pink-600'>{context?.user?.name}</span>, führe deine Zahlung durch</h1>

            {/* main card */}
            <div className="mt-4 bg-white rounded-2xl border border-slate-200 p-6 lg:p-10 shadow-sm relative">
              {/* step pill */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-pink-500 text-white text-xs font-semibold px-4 py-1 rounded-full shadow">Letzter Schritt</div>

              {/* transaction summary */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-600">{props.t('account.payment.transaction.title')}</h3>
                <h3 className="text-lg lg:text-xl font-bold">{props.t('account.payment.transaction.description')} <span className="text-pink-500">{fetch.data?.quantity}</span> {props.t('account.payment.transaction.for')} <span className="text-pink-500">€ {fetch.data?.amount}</span></h3>
              </div>

              {/* tabs */}
              <div className="w-full flex justify-center items-center">
                <div className="flex my-2 space-x-2 bg-gray-100 p-1 rounded-full">
                  <button className={`px-4 py-2 text-xs font-semibold rounded-full ${!directDebit ? 'bg-white shadow' : 'text-gray-600'}`} onClick={() => setDirectDebit(false)}>{props.t('account.payment.payment.method.credit_card')}</button>
                  <button className={`px-4 py-2 text-xs font-semibold rounded-full ${directDebit ? 'bg-white shadow' : 'text-gray-600'}`} onClick={() => setDirectDebit(true)}>{props.t('account.payment.payment.method.sepa')}</button>
                </div>
              </div>

              {/* form */}
              <PaymentForm
              inputs={{
                ...!directDebit && { credit_card_name: {
                  label: props.t('account.billing.card.form.name_on_card'),
                  type: 'text',
                  required: true,
                  labelClassname: 'font-normal',
                },
                token: {
                  label: props.t('account.payment.form.token.label'),
                  type: 'creditcard',
                  required: true,
                },
              },
                ...directDebit && 
                { 
                  account_holder_name: {
                    label: props.t('account.payment.form.account_holder_name.label'),
                    type: 'text',
                    required: true,
                  },
                  iban: {
                    label: props.t('account.payment.form.iban.label'),
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
              account={true}
              isEmail={context?.user?.accounts?.[0]?.email}
              url={`/api/transaction/payment/${id}`}
              method='POST'
              customDisabled={() => setClicked(false)}
              callback={ res => {
                // save the plan to context, then redirect
                // Event('selected_plan', { plan: res.data.plan });
                const user = JSON.parse(localStorage.getItem('user'));

                if (user && Array.isArray(user.accounts) && user.accounts[0]) {
                  const currentVC = user.accounts[0].virtual_currency || 0;
                  const updatedVC = currentVC + (res.data.data.quantity || 0);

                  context.update({
                    accounts: [
                      {
                        ...user.accounts[0],
                        virtual_currency: updatedVC
                      }
                    ]
                  });
                  navigate('/account/billing');
                }

              }}
              customBtnTrigger={customBtnClick}
            />

              {/* actions row */}
              <div className="mt-6 flex items-center justify-between">
                <button className={`bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-full text-sm font-semibold ${clicked && 'opacity-50'}`} onClick={(e) => {
              e.preventDefault();
              if(!clicked){
                setCustomBtnClick(prev => prev + 1);
                setClicked(true);
              }
                }} disabled={clicked}>
                  {props.t('account.payment.checkout.pay_now')}
                </button>
                <div className="text-[11px] text-gray-500">Gutschein-Code vorhanden?</div>
              </div>
            </div>
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
