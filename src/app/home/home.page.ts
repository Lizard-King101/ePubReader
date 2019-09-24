import { Component } from '@angular/core';
import { FilesManager } from '../services/files.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  display: string
  constructor(
    private files: FilesManager
  ) {
    files.listFileSys(1);
  }

  onScan(ev: any) {
    console.log(ev);
    this.files.listFileSys(parseInt(ev.detail.value));
  }

}
