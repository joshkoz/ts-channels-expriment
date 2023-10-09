import { faker } from '@faker-js/faker';
import {
  BoundedChannel,
  ChannelReader,
  ChannelWriter,
} from './boundedChannel.js';

type DataObject = {
  prop1: string;
  prop2: string;
  prop3: string;
};

async function producer(channelWriter: ChannelWriter<DataObject>) {
  while (true) {
    const itemCount = 10_000_000;
    for (let i = 0; i < itemCount; i++) {
      const data: DataObject = {
        prop1: faker.person.firstName(),
        prop2: faker.commerce.productName(),
        prop3: faker.internet.email(),
      };

      await channelWriter.write(data);
    }
    console.log('[Producer]: 10 million items written in producer');
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  channelWriter.close();
}

async function toUpperCaseService(
  inputChannelReader: ChannelReader<DataObject>,
  outputChannelWriter: ChannelWriter<DataObject>
) {
  for await (let data of inputChannelReader.readAll()) {
    const transformedData: DataObject = {
      prop1: data.prop1.toUpperCase(),
      prop2: data.prop2.toUpperCase(),
      prop3: data.prop3.toUpperCase(),
    };
    await outputChannelWriter.write(transformedData);
  }
  console.log('Channel Closed');
  outputChannelWriter.close();
}

async function printService(channelReader: ChannelReader<DataObject>) {
  let count = 0;
  for await (let data of channelReader.readAll()) {
    count++;
    // await new Promise((resolve) => setTimeout(resolve, 10000));
    if (count % 1000 == 0) {
      console.log(`[Printer]: Processed ${count} items`);
    }
    // console.log(data);
  }
  console.log('Found that Channel Closed');
}

// Usage:

const channel1 = new BoundedChannel<DataObject>(5);
const channel2 = new BoundedChannel<DataObject>(5);

const producerWriter = new ChannelWriter(channel1);
const toUpperCaseReader = new ChannelReader(channel1);
const toUpperCaseWriter = new ChannelWriter(channel2);
const printReader = new ChannelReader(channel2);

producer(producerWriter);
toUpperCaseService(toUpperCaseReader, toUpperCaseWriter);
printService(printReader);
