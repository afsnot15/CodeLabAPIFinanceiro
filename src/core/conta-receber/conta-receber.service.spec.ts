import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as fs from 'fs';
import { Repository } from 'typeorm';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import { IFindAllOrder } from '../../shared/interfaces/find-all-order.interface';
import { ExportPdfService } from '../../shared/services/export-pdf.service';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { ContaReceberService } from './conta-receber.service';
import { ContaReceberBaixa } from './entities/conta-receber-baixa.entity';
import { ContaReceber } from './entities/conta-receber.entity';

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}));

describe('ContaReceberService', () => {
  let service: ContaReceberService;
  let repository: Repository<ContaReceber>;

  const mockGrpcUsuarioService = {
    FindOne: jest.fn(),
  };

  const mockClientGrpc = {
    getService: jest.fn().mockReturnValue(mockGrpcUsuarioService),
  };

  const mockMailService = {
    emit: jest.fn(),
  };

  const mockExportPdfService = {
    export: jest.fn(),
  };

  const mockRedisCacheService = {
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContaReceberService,
        {
          provide: getRepositoryToken(ContaReceber),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            delete: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ContaReceberBaixa),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: 'GRPC_USUARIO',
          useValue: mockClientGrpc,
        },
        {
          provide: 'MAIL_SERVICE',
          useValue: mockMailService,
        },
        {
          provide: ExportPdfService,
          useValue: mockExportPdfService,
        },
        {
          provide: RedisCacheService,
          useValue: mockRedisCacheService,
        },
      ],
    }).compile();

    service = module.get<ContaReceberService>(ContaReceberService);

    repository = module.get<Repository<ContaReceber>>(
      getRepositoryToken(ContaReceber),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('criar um novo conta receber', async () => {
      const createContaReceberDto = {
        idPessoa: 1,
        pessoa: 'pessoa',
        idUsuarioLancamento: 1,
        valorTotal: 150,
        pago: true,
        baixa: [],
      };

      const mockContaReceber = Object.assign(createContaReceberDto, { id: 1 });

      const spyRepositorySave = jest
        .spyOn(repository, 'save')
        .mockReturnValue(Promise.resolve(mockContaReceber) as any);

      const response = await service.create(createContaReceberDto);

      expect(response).toEqual(mockContaReceber);
      expect(spyRepositorySave).toHaveBeenCalled();
    });

    it('lançar erro ao repetir um email quando criar um novo conta-receber', async () => {
      const createContaReceberDto = {
        idPessoa: 1,
        pessoa: 'pessoa',
        idUsuarioLancamento: 1,
        valorTotal: 150,
        pago: true,
        baixa: [],
      };

      const mockContaReceber = Object.assign(createContaReceberDto, { id: 1 });

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(mockContaReceber) as any);

      try {
        await service.create(createContaReceberDto);
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(EMensagem.ImpossivelCadastrar);
        expect(spyRepositoryFindOne).toHaveBeenCalled();
      }
    });
  });

  describe('findAll', () => {
    it('obter uma listagem de conta receber', async () => {
      const mockListaContaReceber = [
        {
          idPessoa: 1,
          pessoa: 'pessoa',
          idUsuarioLancamento: 1,
          valorTotal: 150,
          pago: true,
          baixa: [],
        },
      ];

      const resultExpected = {
        count: 1,
        data: mockListaContaReceber,
        message: null,
      };

      const spyRepositoryFindAndCount = jest
        .spyOn(repository, 'findAndCount')
        .mockReturnValue(Promise.resolve([mockListaContaReceber, 1]) as any);

      const order: IFindAllOrder = { column: 'id', sort: 'asc' };

      const response = await service.findAll(1, 10, order);

      expect(response).toEqual(resultExpected);
      expect(spyRepositoryFindAndCount).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('obter um conta receber', async () => {
      const mockContaReceber = {
        idPessoa: 1,
        pessoa: 'pessoa',
        idUsuarioLancamento: 1,
        valorTotal: 150,
        pago: true,
        baixa: [],
      };

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(mockContaReceber) as any);

      const response = await service.findOne(1);

      expect(response).toEqual(mockContaReceber);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('alterar um conta receber', async () => {
      const updateContaReceberDto = {
        id: 1,
        idPessoa: 1,
        pessoa: 'pessoa',
        idUsuarioLancamento: 1,
        valorTotal: 150,
        pago: true,
        baixa: [],
      };

      const mockContaReceber = Object.assign(updateContaReceberDto, {});

      const spyRepositorySave = jest
        .spyOn(repository, 'save')
        .mockReturnValue(Promise.resolve(mockContaReceber) as any);

      const response = await service.update(1, updateContaReceberDto);

      expect(response).toEqual(updateContaReceberDto);
      expect(spyRepositorySave).toHaveBeenCalled();
    });

    it('lançar erro ao enviar ids diferentes quando alterar um conta-receber', async () => {
      const updateContaReceberDto = {
        id: 1,
        idPessoa: 1,
        pessoa: 'pessoa',
        idUsuarioLancamento: 1,
        valorTotal: 150,
        pago: true,
        baixa: [],
      };

      try {
        await service.update(2, updateContaReceberDto);
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(EMensagem.IDsDiferentes);
      }
    });

    it('lançar erro ao repetir um email já utilizado quando alterar um conta-receber', async () => {
      const updateContaReceberDto = {
        id: 1,
        idPessoa: 1,
        pessoa: 'pessoa',
        idUsuarioLancamento: 1,
        valorTotal: 150,
        pago: true,
        baixa: [],
      };

      const mockContaReceberFindOne = {
        id: 2,
        idPessoa: 1,
        pessoa: 'pessoa',
        idUsuarioLancamento: 1,
        valorTotal: 150,
        pago: true,
        baixa: [],
      };

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(mockContaReceberFindOne) as any);

      try {
        await service.update(1, updateContaReceberDto);
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(EMensagem.ImpossivelAlterar);
        expect(spyRepositoryFindOne).toHaveBeenCalled();
      }
    });
  });

  describe('deletar', () => {
    it('deletar um conta receber', async () => {
      const spyRepositoryDelete = jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1, raw: null } as any);

      const response = await service.delete(1);

      expect(response).toEqual(true);
      expect(spyRepositoryDelete).toHaveBeenCalled();
    });
  });

  describe('exportPdf', () => {
    it('deve exportar pdf do relatorio do contas receber', async () => {
      const mockContaReceberFind = [
        {
          id: 2,
          idPessoa: 1,
          pessoa: 'pessoa',
          valorTotal: 150,
          pago: true,
        },
      ];

      jest.mock('fs', () => ({
        readFileSync: jest.fn(),
      }));

      const mockFilePath = '/path/to/exported/file.pdf';
      const mockFileData = Buffer.from('fake file data');

      (fs.readFileSync as jest.Mock).mockReturnValue(mockFileData);

      mockExportPdfService.export.mockResolvedValue(mockFilePath);

      const spyRepositoryFind = jest
        .spyOn(repository, 'find')
        .mockResolvedValue(mockContaReceberFind as any);

      const response = await service.exportPdf(1, {
        column: 'id',
        sort: 'asc',
      });

      expect(response).toEqual(true);

      expect(spyRepositoryFind).toHaveBeenCalled();
    });
  });
});
