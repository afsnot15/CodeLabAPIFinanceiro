import { Logger } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import { IFindAllOrder } from '../../shared/interfaces/find-all-order.interface';
import { ContaReceberController } from './conta-receber.controller';
import { ContaReceberService } from './conta-receber.service';
describe('ContaReceberController', () => {
  let controller: ContaReceberController;
  let service: ContaReceberService;
  let context: RmqContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContaReceberController],
      providers: [
        {
          provide: ContaReceberService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            exportPdf: jest.fn(),
            baixar: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ContaReceberController>(ContaReceberController);
    service = module.get<ContaReceberService>(ContaReceberService);
    context = {
      getChannelRef: jest.fn().mockReturnValue({
        ack: jest.fn(),
        nack: jest.fn(),
      }),
      getMessage: jest.fn().mockReturnValue({}),
    } as unknown as RmqContext;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

      const spyServiceCreate = jest
        .spyOn(service, 'create')
        .mockReturnValue(Promise.resolve(mockContaReceber) as any);

      const response = await controller.create(createContaReceberDto);

      expect(response.message).toEqual(EMensagem.SalvoSucesso);
      expect(response.data).toEqual(mockContaReceber);
      expect(spyServiceCreate).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('obter uma listage de conta receber', async () => {
      const mockListContaReceber = [
        {
          idPessoa: 1,
          pessoa: 'pessoa',
          idUsuarioLancamento: 1,
          valorTotal: 150,
          pago: true,
          baixa: [],
        },
      ];

      const spyServiceFindAll = jest.spyOn(service, 'findAll').mockReturnValue(
        Promise.resolve({
          data: mockListContaReceber,
          count: 1,
          message: null,
        }) as any,
      );

      const order: IFindAllOrder = { column: 'id', sort: 'asc' };
      const response = await controller.findAll(1, 10, order);

      expect(spyServiceFindAll).toHaveBeenCalledWith(1, 10, order, undefined);
      expect(response.data).toEqual(mockListContaReceber);
      expect(spyServiceFindAll).toHaveBeenCalled();
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
      const spyServiceFindOne = jest
        .spyOn(service, 'findOne')
        .mockReturnValue(Promise.resolve(mockContaReceber) as any);

      const response = await controller.findOne(1);

      expect(response.message).toEqual(undefined);
      expect(response.data).toEqual(mockContaReceber);
      expect(spyServiceFindOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('alterar um conta receber', async () => {
      const mockContaReceber = {
        id: 1,
        idPessoa: 1,
        pessoa: 'pessoa',
        idUsuarioLancamento: 1,
        valorTotal: 150,
        pago: true,
        baixa: [],
      };

      const spyServiceUpdate = jest
        .spyOn(service, 'update')
        .mockReturnValue(Promise.resolve(mockContaReceber) as any);

      const response = await controller.update(1, mockContaReceber);

      expect(response.message).toEqual(EMensagem.AtualizadoSucesso);
      expect(response.data).toEqual(mockContaReceber);
      expect(spyServiceUpdate).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('remover um conta a receber', async () => {
      const spyServiceUpdate = jest
        .spyOn(service, 'delete')
        .mockReturnValue(Promise.resolve(false) as any);

      const response = await controller.delete(1);

      expect(response.message).toEqual(EMensagem.ExcluidoSucesso);
      expect(response.data).toEqual(false);
      expect(spyServiceUpdate).toHaveBeenCalled();
    });
  });

  describe('exportPdf', () => {
    it('exportar relatorio pdf', async () => {
      const spyServiceExportPdf = jest
        .spyOn(service, 'exportPdf')
        .mockReturnValue(Promise.resolve(true) as any);

      const order: IFindAllOrder = { column: 'id', sort: 'asc' };

      const response = await controller.exportPdf(1, order);

      expect(spyServiceExportPdf).toHaveBeenCalled();
      expect(response.message).toEqual(EMensagem.IniciadaGeracaoPDF);
    });
  });

  describe('baixar', () => {
    it('registrar uma baixa em um conta receber', async () => {
      const mockContaReceberBaixa = {
        idContaReceber: 1,
        idUsuarioBaixa: 1,
        valorPago: 150,
      };

      const spyServiceBaixar = jest
        .spyOn(service, 'baixar')
        .mockReturnValue(Promise.resolve(true) as any);

      const response = await controller.baixar(mockContaReceberBaixa);

      expect(spyServiceBaixar).toHaveBeenCalled();
      expect(response.message).toEqual(EMensagem.BaixadoSucesso);
    });
  });

  describe('createContaReceber', () => {
    it('cria um conta receber através da mensageria', async () => {
      const mockContaReceber = {
        id: 1,
        idPessoa: 1,
        pessoa: 'pessoa',
        idUsuarioLancamento: 1,
        valorTotal: 150,
        pago: true,
        baixa: [],
      };

      const spyServiceCreate = jest
        .spyOn(service, 'create')
        .mockReturnValue(Promise.resolve(true) as any);

      await controller.createContaReceber(mockContaReceber, context);

      expect(spyServiceCreate).toHaveBeenCalledWith(mockContaReceber);
      expect(context.getChannelRef().ack).toHaveBeenCalled();
      expect(context.getChannelRef().nack).not.toHaveBeenCalled();
    });
    it('deve tratar erro ao criar uma conta a receber', async () => {
      const mockContaReceber = {
        id: 1,
        idPessoa: 1,
        pessoa: 'pessoa',
        idUsuarioLancamento: 1,
        valorTotal: 150,
        pago: true,
        baixa: [],
      };

      const spyServiceCreate = jest
        .spyOn(service, 'create')
        .mockReturnValue(Promise.resolve(true) as any);

      const error = new Error('Erro ao criar conta a receber');
      jest.spyOn(service, 'create').mockRejectedValueOnce(error);

      await controller.createContaReceber(mockContaReceber, context);

      expect(spyServiceCreate).toHaveBeenCalledWith(mockContaReceber);
      expect(context.getChannelRef().ack).toHaveBeenCalled();
      expect(context.getChannelRef().nack).toHaveBeenCalled();
    });
  });
});
