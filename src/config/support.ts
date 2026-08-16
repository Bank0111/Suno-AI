export interface SupportConfig {
  qrImage: string;
  paymentMethod: string;
  recipientName: string;
  promptPayId?: string;
}

export const supportConfig: SupportConfig = {
  qrImage: '/support/qr-promptpay.png',
  paymentMethod: 'PromptPay',
  recipientName: 'ธวัชชัย ประดิษฐ์มนต์',
  promptPayId: '140000955357936',
};
