import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'temps'
})
export class TempsPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
