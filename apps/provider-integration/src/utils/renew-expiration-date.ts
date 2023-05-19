import * as moment from 'moment';
import { Channel } from '../model/channel.entity';

/* 
    Returns now + source.runIntervalHours + 24 hours.
    <br>
    Gives products 1 source run interval + 1 day to get 
    refresh or keep alive signal.
  */
export function renewExpirationDate(source: Channel): Date {
  return moment()
    .add(source.runIntervalHours + 24, 'hours')
    .toDate();
}
