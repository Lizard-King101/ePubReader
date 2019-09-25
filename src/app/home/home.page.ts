import { Component } from '@angular/core';
import { FilesManager } from '../services/files.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  display: string;
  which: number = 1;
  recursive: boolean;
  constructor(
    private files: FilesManager
  ) {
    files.loadFiles(this.which, this.recursive);
  }

  onScan() {
    let which = typeof this.which == 'string' ? parseInt(this.which) : this.which;
    this.files.loadFiles(which, this.recursive);
  }

}
