import { Injectable } from '@angular/core';
import { File, Entry } from '@ionic-native/file/ngx';
import EPub from './epub.service';
//import { Diagnostic } from '@ionic-native/diagnostic/ngx';

@Injectable()
export class FilesManager{
    public fileArray = [];
    private basePath = "";

    constructor(
        private file: File
    ) { }

    public loadFiles(which, recurse = true) {
        this.fileArray = [];
        switch(which) {
            case 1:
                this.basePath = this.file.externalRootDirectory;
            break;
            case 2:
                this.basePath = this.file.externalDataDirectory;
                break;
            case 3:
                this.basePath = this.file.dataDirectory;
                break;
            default:
                alert( "which???:" + which);
                return;
        }
        this.fileLoad("", recurse).then((files)=>{
            console.log('FINAL', files);
        });
    }

    private fileLoad(path, recursive) {
        return new Promise(res => {
            let tmp = {};
            this.file.listDir(this.basePath, path).then((files: Entry[]) => {
                let waiting = 0;
                let loaded = 0;
                files.forEach((file: Entry, i)=>{
                    console.log(path + ' : '+ file.name);
                    
                    if(this.isDirectory(file)) {
                        let currentPath = path != '' ? path + '/' + file.name : file.name;
                        if(recursive) {
                            waiting ++;
                            this.fileLoad(currentPath, recursive).then((data) => {
                                console.log('loaded: '+currentPath, data);
                                if(data && Object.keys(data).length > 0) {
                                    tmp[file.name] = data;
                                }
                                loaded ++;
                                if(waiting === loaded) { res(tmp); }
                            });
                        } else {
                            tmp[file.name] = 'folder';
                        }
                    }else if(file.isFile) {
                        if(file.name.split('.').pop() == 'epub'){
                            this.createEpub(file);
                        }
                        console.log('file: '+path+' : '+ file.name);
                        tmp[file.name] = file.fullPath;
                    }else {
                        tmp[file.name] = null;
                    }
                    if(i == files.length - 1 && waiting === loaded) {
                        res(tmp);
                    }
                });

            }).catch((error)=>{
                console.log('Error at: '+ path, error);
                res(false);
            })
        })
    }

    isDirectory(file) {
        let dir = true;
        if (file.isDirectory) {
            // check full name
            if((['.','..', 'Android', 'data']).indexOf(file.name) >= 0) {dir = false;}

            // check for . folders
            if(file.name.split('.').length > 1) {dir = false;}

        } else {
            dir = false;
        }

        return dir;
    }

    createEpub(file: Entry) {
        const epub = new EPub(this.basePath + file.name)
        this.fileArray.push(epub);
        console.log(epub);
    }

}
