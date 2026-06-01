import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress?: string;
  shippingCity?: string;
  estimatedDelivery?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    } else {
      this.logger.warn(
        'SENDGRID_API_KEY is not defined. Emails will fail to send.',
      );
    }
  }

  // Helper function to format currency properly with commas
  private formatCurrency(value: number | string): string {
    const num = typeof value === 'number' ? value : parseFloat(value);
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  async sendOrderConfirmation(to: string, data: OrderEmailData): Promise<void> {
    const from =
      this.configService.get<string>('EMAIL_FROM') ||
      this.configService.get<string>('SMTP_FROM') ||
      'No Reply <noreply@ecommerce.com>';

    // Build the items HTML rows
    const itemsHtml = data.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee; color: #333;">${item.productName}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; color: #555;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; color: #555;">$${this.formatCurrency(item.unitPrice)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #333;">$${this.formatCurrency(item.lineTotal)}</td>
      </tr>
    `,
      )
      .join('');

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background-color: #ffffff;">
        
        <!-- Header con Logo -->
        <div style="background-color: #1a1a1a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <img src="https://res.cloudinary.com/ds7js53vz/image/upload/v1779898616/eie/logos/EIE_Imagen.jpg" alt="EIE Logo" style="max-height: 80px; width: auto; vertical-align: middle;">
        </div>
        
        <div style="padding: 30px 20px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
          <!-- Saludo y Confirmación -->
          <h1 style="color: #1a1a1a; font-size: 24px; margin-top: 0;">¡Gracias por tu compra!</h1>
          <p style="font-size: 16px; line-height: 1.5;">Hola, <strong>${data.customerName}</strong>:</p>
          <p style="font-size: 16px; line-height: 1.5; color: #555;">Hemos recibido tu pedido <strong>${data.orderNumber}</strong> y ya estamos preparándolo.</p>
          
          <!-- Bloque de Envío y Pago -->
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>📍 Enviar a:</strong> ${data.shippingAddress}, ${data.shippingCity}</p>
            <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>🚚 Entrega estimada:</strong> ${data.estimatedDelivery || 'Calculando...'}</p>
            <p style="margin: 0; font-size: 14px;"><strong>💳 Método de pago:</strong> Pago Electrónico (Aprobado)</p>
          </div>

          <h3 style="border-bottom: 2px solid #f8ca24; padding-bottom: 8px; color: #1a1a1a; margin-top: 30px;">Resumen de tu pedido</h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 15px;">
            <thead>
              <tr style="background-color: #f4f4f4;">
                <th style="padding: 12px; text-align: left; color: #333;">Producto</th>
                <th style="padding: 12px; text-align: center; color: #333;">Cant.</th>
                <th style="padding: 12px; text-align: right; color: #333;">Precio</th>
                <th style="padding: 12px; text-align: right; color: #333;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 12px; text-align: right; color: #555;">Subtotal:</td>
                <td style="padding: 12px; text-align: right; color: #333;">$${this.formatCurrency(data.subtotal)}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 12px; text-align: right; color: #555;">Envío:</td>
                <td style="padding: 12px; text-align: right; color: #333;">$${this.formatCurrency(data.shippingCost)}</td>
              </tr>
              <tr style="font-size: 1.2em; background-color: #fef9e7;">
                <td colspan="3" style="padding: 15px 12px; text-align: right; font-weight: bold; color: #1a1a1a;">Total Pagado:</td>
                <td style="padding: 15px 12px; text-align: right; font-weight: bold; color: #1a1a1a;">$${this.formatCurrency(data.total)}</td>
              </tr>
            </tfoot>
          </table>
          
          <!-- Call to Action -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="#" style="background-color: #f8ca24; color: #1a1a1a; padding: 14px 28px; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 4px; display: inline-block;">Rastrear mi pedido</a>
          </div>

          <!-- Footer -->
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #888; font-size: 12px; line-height: 1.5;">
            <p style="margin: 0 0 10px 0;">¿Tienes alguna duda con tu cobro o tu envío?<br>Contáctanos en <a href="mailto:soporte@eie.com" style="color: #f8ca24; text-decoration: none;">soporte@eie.com</a></p>
            <p style="margin: 0;">
              <a href="#" style="color: #888; text-decoration: underline;">Términos y Condiciones</a> | 
              <a href="#" style="color: #888; text-decoration: underline;">Políticas de Privacidad</a>
            </p>
          </div>
        </div>
      </div>
    `;

    try {
      await sgMail.send({
        from,
        to,
        subject: `Confirmación de pedido ${data.orderNumber}`,
        html: htmlContent,
      });

      this.logger.log(
        `Email de confirmación enviado a ${to} para la orden ${data.orderNumber}`,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error al enviar correo a ${to}: ${err.message}`,
        err.stack,
      );
    }
  }

  async sendPasswordResetEmail(
    to: string,
    data: { userName: string; resetLink: string; resetToken: string },
  ): Promise<void> {
    const from =
      this.configService.get<string>('EMAIL_FROM') ||
      this.configService.get<string>('SMTP_FROM') ||
      'No Reply <noreply@ecommerce.com>';

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background-color: #ffffff;">
        
        <!-- Header con Logo -->
        <div style="background-color: #1a1a1a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <img src="https://res.cloudinary.com/ds7js53vz/image/upload/v1779898616/eie/logos/EIE_Imagen.jpg" alt="EIE Logo" style="max-height: 80px; width: auto; vertical-align: middle;">
        </div>
        
        <div style="padding: 30px 20px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
          <h1 style="color: #1a1a1a; font-size: 24px; margin-top: 0;">Restablecer tu contraseña</h1>
          <p style="font-size: 16px; line-height: 1.5;">Hola, <strong>${data.userName}</strong>:</p>
          <p style="font-size: 16px; line-height: 1.5; color: #555;">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta. 
            Si tú no realizaste esta solicitud, puedes ignorar este correo de forma segura.
          </p>
          
          <!-- Información de Seguridad -->
          <div style="background-color: #fff8e1; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f8ca24;">
            <p style="margin: 0; font-size: 14px;">
              ⏱️ <strong>Este enlace expira en 15 minutos</strong> por razones de seguridad.
            </p>
          </div>

          <!-- Botón de Acción -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetLink}" style="background-color: #1a1a1a; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 4px; display: inline-block;">Restablecer mi contraseña</a>
          </div>

          <p style="font-size: 14px; color: #888; margin-top: 30px;">
            Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:<br>
            <a href="${data.resetLink}" style="color: #f8ca24; word-break: break-all;">${data.resetLink}</a>
          </p>

          <!-- Footer -->
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #888; font-size: 12px; line-height: 1.5;">
            <p style="margin: 0;">¿Necesitas ayuda? Escríbenos a <a href="mailto:soporte@eie.com" style="color: #f8ca24; text-decoration: none;">soporte@eie.com</a></p>
          </div>
        </div>
      </div>
    `;

    try {
      await sgMail.send({
        from,
        to,
        subject: 'Restablecer contraseña - EIE Ecommerce',
        html: htmlContent,
      });

      this.logger.log(`Email de reset de contraseña enviado a ${to}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error al enviar correo a ${to}: ${err.message}`,
        err.stack,
      );
      throw error;
    }
  }

  async sendVerificationEmail(
    to: string,
    data: { userName: string; otpCode: string; verificationLink: string },
  ): Promise<void> {
    const from =
      this.configService.get<string>('EMAIL_FROM') ||
      this.configService.get<string>('SMTP_FROM') ||
      'No Reply <noreply@ecommerce.com>';

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background-color: #ffffff;">
        
        <!-- Header con Logo -->
        <div style="background-color: #1a1a1a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <img src="https://res.cloudinary.com/ds7js53vz/image/upload/v1779898616/eie/logos/EIE_Imagen.jpg" alt="EIE Logo" style="max-height: 80px; width: auto; vertical-align: middle;">
        </div>
        
        <div style="padding: 30px 20px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
          <h1 style="color: #1a1a1a; font-size: 24px; margin-top: 0;">¡Bienvenido a EIE Ecommerce! 🎉</h1>
          <p style="font-size: 16px; line-height: 1.5;">Hola, <strong>${data.userName}</strong>:</p>
          <p style="font-size: 16px; line-height: 1.5; color: #555;">
            Estamos muy felices de tenerte con nosotros. Para activar tu cuenta y empezar a disfrutar de la mejor experiencia de compra, necesitamos verificar tu correo electrónico.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 14px; color: #555; margin-bottom: 10px;">Tu código de seguridad (OTP) es:</p>
            <div style="background-color: #f8ca24; color: #1a1a1a; font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 15px; border-radius: 6px; display: inline-block;">
              ${data.otpCode}
            </div>
          </div>

          <div style="text-align: center; margin: 20px 0;">
            <p style="font-size: 14px; color: #555; margin-bottom: 15px;">O puedes verificar directamente haciendo clic aquí:</p>
            <a href="${data.verificationLink}" style="background-color: #1a1a1a; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 4px; display: inline-block;">Verificar mi cuenta</a>
          </div>

          <div style="background-color: #fff8e1; padding: 15px; border-radius: 6px; margin: 30px 0; border-left: 4px solid #f8ca24;">
            <p style="margin: 0; font-size: 14px;">
              ⏱️ <strong>Este código y enlace expiran en 5 minutos.</strong>
            </p>
          </div>

          <!-- Footer -->
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #888; font-size: 12px; line-height: 1.5;">
            <p style="margin: 0;">¿No creaste esta cuenta? Puedes ignorar este correo de forma segura.</p>
          </div>
        </div>
      </div>
    `;

    try {
      await sgMail.send({
        from,
        to,
        subject: 'Verifica tu cuenta - EIE Ecommerce',
        html: htmlContent,
      });

      this.logger.log(`Email de verificación enviado a ${to}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error al enviar correo a ${to}: ${err.message}`,
        err.stack,
      );
      throw error;
    }
  }
}
