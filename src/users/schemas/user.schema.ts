import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Instrument, InstrumentSchema } from '../instruments/instrument.schema';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  fullName: string;
  @Prop({ required: true })
  username: string;
  @Prop({ required: true })
  password: string;
  @Prop({ required: true })
  email: string;
  @Prop({ type: [InstrumentSchema] }) // Nested schemas instead of separate Collection for tight coupling
  instruments: Instrument[];
}

export const UserSchema = SchemaFactory.createForClass(User);
