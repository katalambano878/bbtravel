export interface SmsProvider {
  sendSms(input: { to: string; message: string }): Promise<void>;
}

export class NoopSmsProvider implements SmsProvider {
  async sendSms() {
    return;
  }
}

export function createSmsProvider(): SmsProvider {
  // Placeholder abstraction for Hubtel/Twilio integration in production.
  return new NoopSmsProvider();
}
