import { MessageErrorHandler } from '@golevelup/nestjs-rabbitmq';
import { Logger } from '@nestjs/common';
import { Channel, ConsumeMessage } from 'amqplib';

export const messageErrorHandler: MessageErrorHandler = (
  channel: Channel,
  msg: ConsumeMessage,
  error: any,
) => {
  const channelMsg = channel ? 'yes channel' : 'no channel';
  Logger.debug(`Error occured (${channelMsg}): ` + JSON.stringify(error));
};
