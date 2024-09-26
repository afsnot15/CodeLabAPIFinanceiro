import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty } from 'class-validator';
import { EMensagem } from '../../../shared/enums/mensagem.enum';
import { CreateContaReceberBaixaDto } from './create-conta-receber-baixa.dto';
import { UpdateContaReceberBaixaDto } from './update-conta-receber-baixa.dto';

export class CreateContaReceberDto {
  @IsNotEmpty({ message: `idPessoa ${EMensagem.NaoPodeSerVazio}` })
  idPessoa: number;

  @IsNotEmpty({ message: `pessoa ${EMensagem.NaoPodeSerVazio}` })
  pessoa: string;

  @IsNotEmpty({ message: `idUsuarioLancamento ${EMensagem.NaoPodeSerVazio}` })
  idUsuarioLancamento: number;

  @IsNotEmpty({ message: `valorTotal ${EMensagem.NaoPodeSerVazio}` })
  valorTotal: number;

  @IsNotEmpty({ message: `pago ${EMensagem.NaoPodeSerVazio}` })
  pago: boolean;

  @IsArray({ message: `baixa ${EMensagem.TipoInvalido}` })
  @Type(() => CreateContaReceberBaixaDto)
  baixa: CreateContaReceberBaixaDto[] | UpdateContaReceberBaixaDto[];
}
