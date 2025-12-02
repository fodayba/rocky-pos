import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Session extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, type: String })
  token: string;

  @Prop({ type: String })
  ipAddress: string;

  @Prop({ type: String })
  userAgent: string;

  @Prop({ required: true, type: Date })
  expiresAt: Date;

  @Prop({ default: false, type: Boolean })
  revoked: boolean;

  @Prop({ default: Date.now, type: Date })
  lastActivity: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);

// Indexes for efficient querying
SessionSchema.index({ userId: 1 });
SessionSchema.index({ token: 1 });
SessionSchema.index({ expiresAt: 1 });
