'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Check, CheckCircle2, ChevronRight, Package, CreditCard, User, MapPin } from 'lucide-react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Link from 'next/link';
import { useCartStore } from '@/store/cart-store';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import api from '@/services/api';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { formatCOP } from '@/types';

type Step = 1 | 2 | 3;

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { items, subtotal, clearCart } = useCartStore();
  
  const [step, setStep] = useState<Step>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  // Form State
  const [shipping, setShipping] = useState({ name: '', address: '', city: '', phone: '' });
  const [payment, setPayment] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const shippingCost = 15;
  const total = subtotal + (items.length > 0 ? shippingCost : 0);

  // If cart is empty and we haven't created an order yet, redirect to cart
  useEffect(() => {
    if (items.length === 0 && step !== 3) {
      router.replace('/cart');
    }
  }, [items.length, step, router]);

  if (items.length === 0 && step !== 3) {
    return null;
  }

  const validateShipping = () => {
    const errs: Record<string, string> = {};
    if (!shipping.name.trim()) errs.name = 'Requerido';
    if (!shipping.address.trim()) errs.address = 'Requerido';
    if (!shipping.city.trim()) errs.city = 'Requerido';
    if (!shipping.phone.trim() || shipping.phone.length < 10) errs.phone = 'Teléfono inválido';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePayment = () => {
    const errs: Record<string, string> = {};
    if (payment.number.replace(/\s/g, '').length < 16) errs.number = 'Tarjeta inválida';
    if (!payment.name.trim()) errs.name = 'Requerido';
    if (!/^\d{2}\/\d{2}$/.test(payment.expiry)) errs.expiry = 'Formato MM/AA';
    if (payment.cvv.length < 3) errs.cvv = 'CVV inválido';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateShipping()) setStep(2);
    if (step === 2 && validatePayment()) handleProcessOrder();
  };

  const handleProcessOrder = async () => {
    setIsProcessing(true);
    setOrderError(null);
    try {
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { data } = await api.post(API_ENDPOINTS.ORDERS.CHECKOUT, {
        shippingName: shipping.name,
        shippingAddress: shipping.address,
        shippingCity: shipping.city,
        shippingPhone: shipping.phone
      });

      setCreatedOrder(data);
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setStep(3);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setOrderError(err.response?.data?.message || 'Error al procesar el pago. Por favor, intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-6 py-8">
        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="flex items-center justify-between relative">
             <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full -z-10"></div>
             <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full -z-10 transition-all duration-500"
                style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
             ></div>
             
             {[
               { num: 1, label: 'Envío', icon: MapPin },
               { num: 2, label: 'Pago', icon: CreditCard },
               { num: 3, label: 'Confirmación', icon: Check }
             ].map((s) => (
                <div key={s.num} className="flex flex-col items-center gap-2">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors shadow-sm
                     ${step > s.num ? 'bg-primary text-white' : step === s.num ? 'bg-primary text-white ring-4 ring-blue-100' : 'bg-white text-gray-400 border border-gray-200'}
                   `}>
                     {step > s.num ? <Check size={18} /> : <s.icon size={18} />}
                   </div>
                   <span className={`text-xs font-medium ${step >= s.num ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</span>
                </div>
             ))}
          </div>
        </div>

        {step === 3 ? (
          /* Step 3: Success */
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm animate-fade-in">
             <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
             </div>
             <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Pago exitoso!</h2>
             <p className="text-gray-500 mb-8">Tu pedido ha sido procesado y está en camino.</p>
             
             <div className="bg-gray-50 rounded-xl p-6 text-left mb-8 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                   <span className="text-sm text-gray-500">Número de orden:</span>
                   <span className="font-bold text-primary">{createdOrder?.order?.orderNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-sm text-gray-500">Total pagado:</span>
                   <span className="font-bold text-gray-900">{formatCOP(createdOrder?.order?.total || 0)}</span>
                </div>
             </div>

             <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => router.push('/orders')} className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg font-bold transition-colors">
                  Ver mis pedidos
                </button>
                <button onClick={() => router.push('/catalog')} className="bg-white text-primary border border-gray-200 hover:bg-gray-50 px-8 py-3 rounded-lg font-bold transition-colors">
                  Seguir comprando
                </button>
             </div>
          </div>
        ) : (
          /* Steps 1 and 2: Forms */
          <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
             
             <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8">
               {errorBox()}

               {step === 1 && (
                 <div className="animate-fade-in">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><MapPin className="text-primary"/> Dirección de Envío</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de quien recibe</label>
                        <input type="text" value={shipping.name} onChange={e => setShipping({...shipping, name: e.target.value})} className={`w-full px-4 py-2.5 rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary border ${fieldErrors.name ? 'border-red-300' : 'border-transparent'}`} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección completa</label>
                        <input type="text" placeholder="Ej: Calle 123 #45-67, Apto 801" value={shipping.address} onChange={e => setShipping({...shipping, address: e.target.value})} className={`w-full px-4 py-2.5 rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary border ${fieldErrors.address ? 'border-red-300' : 'border-transparent'}`} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                          <input type="text" value={shipping.city} onChange={e => setShipping({...shipping, city: e.target.value})} className={`w-full px-4 py-2.5 rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary border ${fieldErrors.city ? 'border-red-300' : 'border-transparent'}`} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                          <input type="tel" value={shipping.phone} onChange={e => setShipping({...shipping, phone: e.target.value})} className={`w-full px-4 py-2.5 rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary border ${fieldErrors.phone ? 'border-red-300' : 'border-transparent'}`} />
                        </div>
                      </div>
                    </div>
                 </div>
               )}

               {step === 2 && (
                 <div className="animate-fade-in">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><CreditCard className="text-primary"/> Datos de Pago</h2>
                      <button onClick={() => setStep(1)} className="text-sm font-medium text-primary hover:underline">Volver</button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Número de tarjeta</label>
                        <input type="text" maxLength={19} placeholder="0000 0000 0000 0000" value={payment.number} onChange={e => setPayment({...payment, number: e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim()})} className={`w-full px-4 py-2.5 rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary border ${fieldErrors.number ? 'border-red-300' : 'border-transparent'}`} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre en la tarjeta</label>
                        <input type="text" placeholder="Como aparece en la tarjeta" value={payment.name} onChange={e => setPayment({...payment, name: e.target.value.toUpperCase()})} className={`w-full px-4 py-2.5 rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary border ${fieldErrors.name ? 'border-red-300' : 'border-transparent'}`} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Expiración (MM/AA)</label>
                          <input type="text" placeholder="12/28" maxLength={5} value={payment.expiry} onChange={e => setPayment({...payment, expiry: e.target.value})} className={`w-full px-4 py-2.5 rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary border ${fieldErrors.expiry ? 'border-red-300' : 'border-transparent'}`} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                          <input type="password" placeholder="123" maxLength={4} value={payment.cvv} onChange={e => setPayment({...payment, cvv: e.target.value})} className={`w-full px-4 py-2.5 rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary border ${fieldErrors.cvv ? 'border-red-300' : 'border-transparent'}`} />
                        </div>
                      </div>
                    </div>
                 </div>
               )}

             </div>

             {/* Order Summary Sidebar */}
             <div className="w-full lg:w-[360px] flex-shrink-0">
               <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
                 <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Package size={18}/> Resumen</h3>
                 
                 <div className="max-h-64 overflow-y-auto pr-2 mb-4 space-y-3">
                   {items.map(item => (
                     <div key={item.id} className="flex gap-3">
                       <div className="w-12 h-12 bg-gray-50 rounded-md overflow-hidden flex-shrink-0">
                         {/* eslint-disable-next-line @next/next/no-img-element */}
                         {item.product.mainImage && <img src={item.product.mainImage} alt="" className="w-full h-full object-cover" />}
                       </div>
                       <div className="flex-1 min-w-0">
                         <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                         <p className="text-xs text-gray-500">Cant: {item.quantity}</p>
                       </div>
                       <div className="text-sm font-bold text-gray-900">{formatCOP(Number(item.unitPrice) * item.quantity)}</div>
                     </div>
                   ))}
                 </div>

                 <div className="border-t border-gray-100 pt-4 space-y-3 mb-6">
                   <div className="flex justify-between text-sm text-gray-600">
                     <span>Subtotal</span>
                     <span className="font-medium">{formatCOP(subtotal)}</span>
                   </div>
                   <div className="flex justify-between text-sm text-gray-600">
                     <span>Envío</span>
                     <span className="font-medium">{formatCOP(shippingCost)}</span>
                   </div>
                   <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                     <span className="font-bold text-gray-900">Total</span>
                     <span className="font-bold text-primary text-lg">{formatCOP(total)}</span>
                   </div>
                 </div>

                 <button
                   onClick={handleNext}
                   disabled={isProcessing}
                   className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 h-[52px]"
                 >
                   {isProcessing ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   ) : step === 1 ? (
                     <>Continuar al Pago <ChevronRight size={18} /></>
                   ) : (
                     <>Confirmar y Pagar <Check size={18} /></>
                   )}
                 </button>
               </div>
             </div>

          </div>
        )}
      </main>
      <Footer />
    </div>
  );

  function errorBox() {
    if (!orderError) return null;
    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-fade-in">
        <span className="text-red-500 mt-0.5">⚠️</span>
        <div>
          <h3 className="text-sm font-bold text-red-800">Error en el proceso</h3>
          <p className="text-sm text-red-700">{orderError}</p>
        </div>
      </div>
    );
  }
}
