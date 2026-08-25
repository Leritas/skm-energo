import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { OrderDto } from '@skm/specs';

@Injectable()
export class OrdersMailService {
  private readonly logger = new Logger(OrdersMailService.name);

  constructor(private readonly config: ConfigService) {}

  async sendOrderCreatedEmails(order: OrderDto): Promise<void> {
    const smtpHost = this.config.get<string>('SMTP_HOST');
    const from = this.config.get<string>(
      'ORDERS_FROM_EMAIL',
      'orders@skmenergo.ru',
    );
    const notify = this.config.get<string>('ORDERS_NOTIFY_EMAIL');

    const customerSubject = `Заявка ${order.number} принята`;
    const customerBody = this.formatCustomerEmail(order);
    const internalBody = this.formatInternalEmail(order);

    if (!smtpHost) {
      this.logger.log(
        `SMTP not configured — order email (dev):\n${customerSubject}\n${customerBody}`,
      );
      if (notify) {
        this.logger.log(`Internal notify (dev):\n${notify}\n${internalBody}`);
      }
      return;
    }

    // v1: log-only until TD4 MailService; SMTP env documented for ops setup.
    this.logger.warn(
      `SMTP_HOST set but MailService not implemented (TD4) — logging order ${order.number}`,
    );
    this.logger.log(`To: ${order.customerEmail} From: ${from}\n${customerBody}`);
    if (notify) {
      this.logger.log(`Notify: ${notify}\n${internalBody}`);
    }
  }

  private formatCustomerEmail(order: OrderDto): string {
    const lines = order.lines
      .map(
        (line) =>
          `- ${line.title} (${line.sku}) × ${line.quantity}: ${line.unitPrice ?? 'по запросу'}`,
      )
      .join('\n');
    return [
      `Здравствуйте, ${order.customerName}!`,
      '',
      `Ваша заявка ${order.number} принята.`,
      '',
      lines,
      '',
      `Комментарий: ${order.customerNote ?? '—'}`,
    ].join('\n');
  }

  private formatInternalEmail(order: OrderDto): string {
    return [
      `Новая заявка ${order.number}`,
      `Тип: ${order.type}`,
      `Клиент: ${order.customerName}, ${order.customerEmail}, ${order.customerPhone ?? '—'}`,
      `Компания: ${order.customerCompany ?? '—'}`,
    ].join('\n');
  }
}
