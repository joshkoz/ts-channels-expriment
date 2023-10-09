export class BoundedChannel<T> {
  private queue: T[] = [];
  private readonly capacity: number;
  private readonly waitingReaders: (() => void)[] = [];
  private readonly waitingWriters: { item: T; resolve: () => void }[] = [];
  private closed: boolean = false;

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  async write(item: T): Promise<void> {
    if (this.closed) throw new Error('Channel is closed.');

    if (this.queue.length < this.capacity) {
      this.queue.push(item);
      const waitingReader = this.waitingReaders.pop();
      if (waitingReader) {
        waitingReader();
      }
    } else {
      await new Promise<void>((resolve) => {
        this.waitingWriters.push({ item, resolve });
      });
    }
  }

  async read(): Promise<T | undefined> {
    if (this.queue.length > 0) {
      const item = this.queue.shift()!;
      const waitingWriter = this.waitingWriters.shift();
      if (waitingWriter) {
        this.queue.push(waitingWriter.item);
        waitingWriter.resolve();
      }
      return item;
    } else if (this.closed) {
      return undefined;
    } else {
      return await new Promise<T | undefined>((resolve) => {
        this.waitingReaders.push(() => {
          if (this.queue.length > 0) {
            const item = this.queue.shift()!;
            resolve(item);
          } else {
            resolve(undefined);
          }
        });
      });
    }
  }

  close() {
    this.closed = true;
    // Wake up any waiting readers to inform them that the channel is closed.
    while (this.waitingReaders.length > 0) {
      const waitingReader = this.waitingReaders.pop();
      if (waitingReader) {
        waitingReader();
      }
    }
  }
}

export class ChannelWriter<T> {
  private channel: BoundedChannel<T>;

  constructor(channel: BoundedChannel<T>) {
    this.channel = channel;
  }

  async write(item: T): Promise<void> {
    return this.channel.write(item);
  }

  close() {
    this.channel.close();
  }
}

export class ChannelReader<T> {
  private channel: BoundedChannel<T>;

  constructor(channel: BoundedChannel<T>) {
    this.channel = channel;
  }

  async read(): Promise<T | undefined> {
    return this.channel.read();
  }

  async *readAll(): AsyncIterableIterator<T> {
    let value: T | undefined;
    while ((value = await this.read()) !== undefined) {
      yield value;
    }
  }
}
