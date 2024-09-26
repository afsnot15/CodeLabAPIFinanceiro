import { IsNotEmpty } from 'class-validator';
import { EMensagem } from '../../../shared/enums/mensagem.enum';

export class CreateContaReceberBaixaDto {
  @IsNotEmpty({ message: `idContaReceber ${EMensagem.NaoPodeSerVazio}` })
  idContaReceber: number;

  @IsNotEmpty({ message: `idUsuarioBaixa ${EMensagem.NaoPodeSerVazio}` })
  idUsuarioBaixa: number;

  @IsNotEmpty({ message: `valorPago ${EMensagem.NaoPodeSerVazio}` })
  valorPago: number;
}
