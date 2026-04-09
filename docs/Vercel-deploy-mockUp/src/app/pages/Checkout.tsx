import { useState } from "react";
import { useNavigate } from "react-router";
import { CheckCircle2, ChevronRight, Package, AlertCircle } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { useApp, Order } from "../context/AppContext";

const STEPS = ["Resumen", "Envío", "Pago", "Confirmación"];

interface ShippingForm {
  name: string;
  address: string;
  city: string;
  phone: string;
}

interface PaymentForm {
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardName: string;
}

interface ShippingErrors {
  name?: string;
  address?: string;
  city?: string;
  phone?: string;
}

interface PaymentErrors {
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  cardName?: string;
}

export function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart, addOrder, currentUser } = useApp();
  const [step, setStep] = useState(0);
  const [shipping, setShipping] = useState<ShippingForm>({
    name: currentUser?.name || "",
    address: currentUser?.address || "",
    city: "Bogotá",
    phone: currentUser?.phone || "",
  });
  const [payment, setPayment] = useState<PaymentForm>({ cardNumber: "", expiry: "", cvv: "", cardName: "" });
  const [order, setOrder] = useState<Order | null>(null);
  const [shippingErrors, setShippingErrors] = useState<ShippingErrors>({});
  const [paymentErrors, setPaymentErrors] = useState<PaymentErrors>({});
  const [cardDeclined, setCardDeclined] = useState(false);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping_cost = 15000;
  const total = subtotal + shipping_cost;

  const handlePlaceOrder = () => {
    const now = new Date();
    const orderId = `ORD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(Math.floor(Math.random() * 99999)).padStart(5, "0")}`;
    const newOrder: Order = {
      id: orderId,
      date: now.toISOString().split("T")[0],
      total,
      status: "Procesado",
      items: [...cart],
    };
    addOrder(newOrder);
    setOrder(newOrder);
    clearCart();
    setStep(3);
  };

  const formatCard = (val: string) => val.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19);
  const formatExpiry = (val: string) => val.replace(/\D/g, "").replace(/^(.{2})/, "$1/").slice(0, 5);

  // Shipping validation
  const validateShipping = (): boolean => {
    const errors: ShippingErrors = {};
    if (!shipping.name.trim()) errors.name = "El nombre es obligatorio";
    if (!shipping.address.trim()) errors.address = "La dirección de entrega es obligatoria";
    if (!shipping.city.trim()) errors.city = "La ciudad es obligatoria";
    if (!shipping.phone.trim() || !/^\d{10}$/.test(shipping.phone.replace(/\s/g, ""))) {
      errors.phone = "Ingresa un número válido de 10 dígitos";
    }
    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Payment validation
  const validatePayment = (): boolean => {
    const errors: PaymentErrors = {};
    const rawCard = payment.cardNumber.replace(/\s/g, "");
    if (rawCard.length < 16) errors.cardNumber = "El número de tarjeta debe tener 16 dígitos";

    if (payment.expiry.length === 5) {
      const [mm, yy] = payment.expiry.split("/").map(Number);
      const now = new Date();
      const expDate = new Date(2000 + yy, mm - 1);
      if (expDate < now) errors.expiry = "La tarjeta está vencida";
    } else {
      errors.expiry = "La tarjeta está vencida";
    }

    if (payment.cvv.length < 3) errors.cvv = "El CVV debe tener 3 dígitos";
    if (!payment.cardName.trim()) errors.cardName = "El nombre en la tarjeta es obligatorio";

    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleShippingContinue = () => {
    if (validateShipping()) setStep(2);
  };

  const handleConfirmOrder = () => {
    setCardDeclined(false);
    if (!validatePayment()) return;
    // Simulate declined card for demo (card starting with 0000)
    if (payment.cardNumber.startsWith("0000")) {
      setCardDeclined(true);
      return;
    }
    handlePlaceOrder();
  };

  if (cart.length === 0 && step < 3) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-[1280px] mx-auto px-6 py-20 text-center">
          <p className="text-gray-500 mb-4">No tienes productos en el carrito.</p>
          <button onClick={() => navigate("/catalog")} className="text-[#2E75B6] hover:underline text-sm">Ir al catálogo</button>
        </div>
      </div>
    );
  }

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
      hasError ? "border-red-500 bg-red-50 focus:ring-red-200" : "border-gray-200"
    }`;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-[960px] mx-auto px-6 py-8">
        <h1 className="text-gray-900 text-xl mb-6">Finalizar compra</h1>

        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                    i < step ? "bg-green-500 text-white" : i === step ? "text-white" : "bg-gray-100 text-gray-400"
                  }`}
                  style={i === step ? { backgroundColor: "#2E75B6" } : {}}
                >
                  {i < step ? <CheckCircle2 size={16} /> : i + 1}
                </div>
                <span className={`text-xs mt-1 hidden sm:block ${i === step ? "text-[#2E75B6] font-medium" : "text-gray-400"}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-4 ${i < step ? "bg-green-400" : "bg-gray-100"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-8 flex-col lg:flex-row">
          <div className="flex-1">
            {/* Step 0: Cart review */}
            {step === 0 && (
              <div>
                <h2 className="text-gray-800 mb-4">Resumen del carrito</h2>
                <div className="border border-gray-100 rounded-xl overflow-hidden mb-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-50" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-400">Cantidad: {item.quantity}</p>
                      </div>
                      <span className="text-sm text-gray-800">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setStep(1)} className="w-full py-3 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2" style={{ backgroundColor: "#2E75B6" }}>
                  Continuar <ChevronRight size={15} />
                </button>
              </div>
            )}

            {/* Step 1: Shipping */}
            {step === 1 && (
              <div>
                <h2 className="text-gray-800 mb-4">Información de envío</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Nombre completo</label>
                    <input
                      value={shipping.name}
                      onChange={e => { setShipping({ ...shipping, name: e.target.value }); setShippingErrors(p => ({ ...p, name: undefined })); }}
                      className={inputClass(!!shippingErrors.name)}
                      placeholder="Juan Pérez García"
                    />
                    {shippingErrors.name && <p className="text-xs text-red-600 mt-1">{shippingErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Dirección de entrega</label>
                    <input
                      value={shipping.address}
                      onChange={e => { setShipping({ ...shipping, address: e.target.value }); setShippingErrors(p => ({ ...p, address: undefined })); }}
                      className={inputClass(!!shippingErrors.address)}
                      placeholder="Calle 123 #45-67"
                    />
                    {shippingErrors.address && <p className="text-xs text-red-600 mt-1">{shippingErrors.address}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Ciudad</label>
                    <input
                      value={shipping.city}
                      onChange={e => { setShipping({ ...shipping, city: e.target.value }); setShippingErrors(p => ({ ...p, city: undefined })); }}
                      className={inputClass(!!shippingErrors.city)}
                      placeholder="Bogotá"
                    />
                    {shippingErrors.city && <p className="text-xs text-red-600 mt-1">{shippingErrors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Teléfono de contacto</label>
                    <input
                      value={shipping.phone}
                      onChange={e => { setShipping({ ...shipping, phone: e.target.value }); setShippingErrors(p => ({ ...p, phone: undefined })); }}
                      className={inputClass(!!shippingErrors.phone)}
                      placeholder="3001234567"
                    />
                    {shippingErrors.phone && <p className="text-xs text-red-600 mt-1">{shippingErrors.phone}</p>}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setStep(0)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Atrás</button>
                    <button
                      onClick={handleShippingContinue}
                      className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2"
                      style={{ backgroundColor: "#2E75B6" }}
                    >
                      Continuar <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div>
                <h2 className="text-gray-800 mb-4">Método de pago</h2>

                {/* Card declined banner */}
                {cardDeclined && (
                  <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <span>Tu tarjeta fue rechazada. Verifica los datos o intenta con otra tarjeta.</span>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 flex items-center gap-2">
                  <span className="text-sm">💳</span>
                  <span className="text-sm text-blue-700">Pago seguro con tarjeta de crédito o débito</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Número de tarjeta</label>
                    <input
                      value={payment.cardNumber}
                      onChange={e => { setPayment({ ...payment, cardNumber: formatCard(e.target.value) }); setPaymentErrors(p => ({ ...p, cardNumber: undefined })); setCardDeclined(false); }}
                      className={inputClass(!!paymentErrors.cardNumber)}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                    {paymentErrors.cardNumber && <p className="text-xs text-red-600 mt-1">{paymentErrors.cardNumber}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Nombre en la tarjeta</label>
                    <input
                      value={payment.cardName}
                      onChange={e => { setPayment({ ...payment, cardName: e.target.value }); setPaymentErrors(p => ({ ...p, cardName: undefined })); }}
                      className={inputClass(!!paymentErrors.cardName)}
                      placeholder="JUAN PÉREZ"
                    />
                    {paymentErrors.cardName && <p className="text-xs text-red-600 mt-1">{paymentErrors.cardName}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Fecha de vencimiento</label>
                      <input
                        value={payment.expiry}
                        onChange={e => { setPayment({ ...payment, expiry: formatExpiry(e.target.value) }); setPaymentErrors(p => ({ ...p, expiry: undefined })); }}
                        className={inputClass(!!paymentErrors.expiry)}
                        placeholder="MM/AA"
                        maxLength={5}
                      />
                      {paymentErrors.expiry && <p className="text-xs text-red-600 mt-1">{paymentErrors.expiry}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">CVV</label>
                      <input
                        value={payment.cvv}
                        onChange={e => { setPayment({ ...payment, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) }); setPaymentErrors(p => ({ ...p, cvv: undefined })); }}
                        className={inputClass(!!paymentErrors.cvv)}
                        placeholder="123"
                        maxLength={3}
                      />
                      {paymentErrors.cvv && <p className="text-xs text-red-600 mt-1">{paymentErrors.cvv}</p>}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">💡 Para simular tarjeta rechazada, ingresa un número que empiece con 0000</p>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Atrás</button>
                    <button
                      onClick={handleConfirmOrder}
                      className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium"
                      style={{ backgroundColor: "#2E75B6" }}
                    >
                      Confirmar pedido
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && order && (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={36} className="text-green-500" />
                  </div>
                </div>
                <h2 className="text-gray-900 text-xl mb-2">¡Pedido confirmado!</h2>
                <p className="text-gray-500 text-sm mb-1">Tu pedido ha sido recibido exitosamente.</p>
                <div className="inline-block bg-blue-50 border border-blue-100 rounded-xl px-6 py-3 mt-4 mb-6">
                  <p className="text-xs text-gray-500 mb-1">Número de pedido</p>
                  <p className="text-[#2E75B6] font-medium text-lg">{order.id}</p>
                </div>
                <div className="border border-gray-100 rounded-xl p-4 text-left mb-6 max-w-sm mx-auto">
                  <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Resumen del pedido</p>
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm py-1">
                      <span className="text-gray-700 flex-1 truncate">{item.name} × {item.quantity}</span>
                      <span className="text-gray-800 ml-2">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between font-medium text-sm">
                    <span>Total</span>
                    <span className="text-[#2E75B6]">{formatPrice(order.total)}</span>
                  </div>
                </div>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => navigate("/orders")} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm" style={{ backgroundColor: "#2E75B6" }}>
                    <Package size={15} /> Ver mis pedidos
                  </button>
                  <button onClick={() => navigate("/")} className="px-6 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-600 hover:bg-gray-50">
                    Ir al inicio
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          {step < 3 && (
            <div className="lg:w-64">
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 sticky top-20">
                <h3 className="text-sm text-gray-800 mb-3">Resumen</h3>
                <div className="space-y-1 text-xs text-gray-600 mb-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span>{formatPrice(shipping_cost)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-medium text-sm text-gray-900">
                    <span>Total</span>
                    <span className="text-[#2E75B6]">{formatPrice(total)}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  {cart.slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-center gap-2">
                      <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover bg-gray-100" />
                      <span className="text-xs text-gray-600 truncate flex-1">{item.name}</span>
                    </div>
                  ))}
                  {cart.length > 3 && <p className="text-xs text-gray-400">+{cart.length - 3} más</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}