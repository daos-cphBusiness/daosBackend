import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type EnsembleDocument = HydratedDocument<Ensemble>;

@Schema()
export class Ensemble {
  @Prop({ required: true })
  name: string;
  @Prop()
  description: string;
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }],
    default: [],
  })
  users: User[];
}

export const EnsembleSchema = SchemaFactory.createForClass(Ensemble);
