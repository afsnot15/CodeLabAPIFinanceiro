export type ChannelRef = {
  ack: (message: unknown) => Promise<void>;
  nack: (message: unknown, pi: boolean, p2: boolean) => void;
};
