import * as moment from 'moment';
import { ProductSource } from '../model/product-source.entity';

/* 
    Returns now + source.runIntervalHours + 24 hours.
    <br>
    Gives products 1 source run interval + 1 day to get 
    refresh or keep alive signal.
  */
export function renewExpirationDate(source: ProductSource): Date {
  return moment()
    .add(source.runIntervalHours + 24, 'hours')
    .toDate();
}
