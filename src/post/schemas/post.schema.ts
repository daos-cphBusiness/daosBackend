import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Ensemble } from '../../ensembles/schemas/ensemble.schema';
import { User } from '../../users/schemas/user.schema';
import mongoose, { HydratedDocument } from 'mongoose';

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  description: string;
  @Prop({ required: true })
  genre: string;
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Ensemble.name }],
    // default: [], not defaulting to an empty array because its optional
  })
  ensemble?: Ensemble[];
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  user: User; // only one user who creates the post
}

export const PostSchema = SchemaFactory.createForClass(Post);
