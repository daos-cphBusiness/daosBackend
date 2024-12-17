import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Instrument, InstrumentSchema } from '../instruments/instrument.schema';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  fullName: string;
  @Prop()
  description: string;
  @Prop({ required: true })
  username: string;
  @Prop({ required: true })
  password: string;
  @Prop({ required: true })
  email: string;
  @Prop({ type: [InstrumentSchema] }) // Nested schemas instead of separate Collection for tight coupling
  instrument: Instrument[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add a global transformation to exclude sensitive fields
UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password; // Remove password field
    return ret;
  },
});

UserSchema.set('toObject', {
  transform: (doc, ret) => {
    delete ret.password; // Remove password field
    return ret;
  },
});
