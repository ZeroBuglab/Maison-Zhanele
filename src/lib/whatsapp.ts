import type { CartProduct } from '@/store/cart';

const whatsappNumber = () => (process.env.NEXT_PUBLIC_ADMIN_WHATSAPP ?? '77758330223').replace(/\D/g, '');

export function whatsappLink(message: string) {
  return `https://wa.me/${whatsappNumber()}?text=${encodeURIComponent(message)}`;
}

export function orderWhatsAppMessage(items: CartProduct[]) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const lines = items.map((item) => `• ${item.name} × ${item.quantity} — ${item.price * item.quantity} ₸`).join('\n');
  return `Здравствуйте! Хочу заказать:\n${lines}\n\nСумма товаров: ${subtotal} ₸\n\nПожалуйста, подтвердите наличие, стоимость доставки и отправьте способы оплаты.`;
}
