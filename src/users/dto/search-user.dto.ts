import { Instrument } from '../instruments/instrument.schema';

export class SearchUserDto {
  username?: string;
  instrument: Instrument;
}
