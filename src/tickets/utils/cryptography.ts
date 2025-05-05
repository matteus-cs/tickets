import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'node:crypto';

@Injectable()
export class Cryptography {
  private readonly algorithm: string = 'aes-256-cbc';
  private readonly secretKey: string;
  constructor(configService: ConfigService) {
    this.secretKey = configService.get<string>(
      'SECRET_KEY_TICKET_HASH',
    ) as string;
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  decrypt(encrypted: string): string {
    const [ivHex, encryptedHex] = encrypted.split(':');
    const ivBuffer = Buffer.from(ivHex, 'hex');
    const encryptedBuffer = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.secretKey,
      ivBuffer,
    );

    const decrypted = Buffer.concat([
      decipher.update(encryptedBuffer),
      decipher.final(),
    ]);

    return decrypted.toString();
  }
}
