import { IsNotEmpty } from 'class-validator';

export class CreateInstrumentDto {
  @IsNotEmpty({ message: 'Field Required' })
  name: string;

  @IsNotEmpty({ message: 'Field Required' })
  genre: string[];
}
