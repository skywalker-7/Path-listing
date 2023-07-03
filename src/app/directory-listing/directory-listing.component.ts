import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';

interface FileInfo {
  name: string;
  path: string;
  size: number;
  extension: string;
  createdDate: Date;
  isDirectory: boolean;
  permissions: {
    readable: boolean;
    writable: boolean;
    executable: boolean;
  };
}

@Component({
  selector: 'app-directory-listing',
  templateUrl: './directory-listing.component.html',
  styleUrls: ['./directory-listing.component.css']
})
export class DirectoryListingComponent implements OnInit {
  directoryPath :string='';
  files: FileInfo[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number= 0;


  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

  getDirectoryListing(directory?: string) {
    if (!this.directoryPath) {
      return;
    }
    this.directoryPath = this.directoryPath.replaceAll(/\\/g, "/");
    if (directory) {
      this.directoryPath = directory.replaceAll(/\\/g, "/");
    }
    this.http.get<any>('http://localhost:3000/directory/'+ this.directoryPath+'?page='+this.currentPage+'&limit='+this.itemsPerPage)
      .subscribe(files => {
        this.files = files.directoryListing as FileInfo[];
        this.totalItems = files.totalFiles;
      }, error => {
        console.error('Failed to retrieve directory listing:', error);
      });
   
  }
  dateTimeFormatter(date: any) {
    let formattedDate;
    return formattedDate = (moment(date)).format('ddd DD-MMM-YYYY hh:mm A');
  }
  svgSelector(File:any) {
      return File.isDirectory ? 'assets/folder.svg' : 'assets/file-earmark.svg'    
  }

  changePage(event: any) {
    this.currentPage = event.page;
    this.getDirectoryListing();
  }

  changeItemsPerPage(event:any) {
    this.itemsPerPage = event.target.value;
    this.getDirectoryListing();
  }

}