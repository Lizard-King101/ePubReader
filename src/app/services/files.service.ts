import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';

@Injectable()
export class FilesManager{
    jcInfo: string;
    jcDebug: string;
    jcError: string;
    fileSysArray = [];

    constructor(
        private file: File,
        private diagnostic: Diagnostic
    ) {
        
    }

    listFileSys(which:number){
        this.jcInfo = "";
        this.jcDebug = "";
        this.jcError = "";

        // <which> chooses the file system - see switch below
        this.jcDebug += "\n" + `listFileSysSKOFLO(${which}: ${typeof which})`;

        this.fileSysArray = [];
        let basePath = "";

        let tag = "unknown";

        // ************** RECURSE *************
        let jcListDir = (thisDir, ok2recurse = true)=>{

            tag = "jcListDir: [" + thisDir + "]";

            this.file.listDir(basePath, thisDir).then( (data) => {
                tag = "listDir:" + thisDir;
                this.jcError += "\n" + tag + ":" + JSON.stringify( data);
                for( let ii = 0; ii < data.length; ii += 1){
                this.jcError += "\n" + data[ii].name + (data[ii].isDirectory? " [D]" : " [F]");

                let currentPath = thisDir;
                currentPath += (currentPath.length ? "/" : "");
                currentPath += data[ii].name;
                this.jcError += "\n" + "currentPath:" + currentPath;

                this.fileSysArray.push( currentPath);

                    if( data[ii].isDirectory && ok2recurse){
                        jcListDir( currentPath);         // RECURSE !!!
                    }
                }
            }, (errData)=>{
                tag = "listDir";
                this.jcError += "\n" + tag + ":ERR:" + JSON.stringify( errData);
            });
        };
        // ************** RECURSE *************

        // ***********************
        let runListDir = ()=>{
            this.jcDebug += "\n" + "basePath:" + basePath;

            // !!! START listing from basePath !!!
            jcListDir(".");
        }

        // ***********************
        switch(which)
        {
        case 1:
            this.diagnostic.getExternalSdCardDetails()
            .then( (data) => {
            this.jcDebug += "\n" + "sd:" + JSON.stringify( data);
            this.jcDebug += "\n" + "Number of cards: " + data.length;
            for( let ii = 0; ii < data.length; ii += 1){
                let thisElem = data[ii];
                if( thisElem.type.toLowerCase() === "application" && thisElem.canWrite){
                basePath = thisElem.filePath;
                break;
                }
            }
            if( !basePath){
                this.jcDebug += "\n" + "no SD card found";
                return;
            }
            runListDir();
            }, (errData)=>{
            tag = "getExternalSdCardDetails";
            this.jcError += "\n" + tag + ":ERR:" + JSON.stringify( errData);
            });
        break;
        case 2:
            basePath = this.file.externalDataDirectory;
            this.jcError += "\n" + "externalDataDirectory:" + basePath;
            runListDir();
            break;
        case 3:
            basePath = this.file.dataDirectory;
            this.jcError += "\n" + "dataDirectory:";
            runListDir();
            break;
        default:
            alert( "which???:" + which);
            return;
        }

        // wait for all to comnplete, then show
        // assume 1000 ms is adequate delay per promise
        let lastFileSysLen = -1
        let checkCount = 30; // max 30 * 1000 ms = 30 seconds

        // ************** RECURSE *************
        let checkComplete = () => {
        this.jcDebug += "\n" + "checkComplete " + checkCount + " [" + this.fileSysArray.length + "]";
            setTimeout( ()=>{

                // fileSysArr length stable?
                if( this.fileSysArray.length === lastFileSysLen){
                checkCount = 0;
                }
                lastFileSysLen = this.fileSysArray.length;

                checkCount -= 1;
                if( checkCount > 0){
                    checkComplete();    // recurse
                } else {

                    // STOP !!! and show FileSysArray
                    this.jcInfo += "\n" + "show FileSysArray";
                    this.jcInfo += "\n" + "fileSysArray.length = " + " [" + this.fileSysArray.length + "]";

                    this.fileSysArray.sort();

                    for( let elem of this.fileSysArray){
                        this.jcInfo += "\n" + elem;
                    }
                }
            }, 1000);
        };
        // ************** RECURSE *************
        checkComplete();
    }

}
