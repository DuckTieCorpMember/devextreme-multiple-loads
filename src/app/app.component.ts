import { NgModule, Component, enableProdMode, ViewChild } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { lastValueFrom, tap } from 'rxjs';

import { DxDataGridModule } from 'devextreme-angular';

import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';

@Component({
    styleUrls: ['./app.component.css'],
  selector: 'demo-app',
  templateUrl: './app.component.html',
})
export class AppComponent {
  dataSource!: DataSource;
  selectedRowKeys = [];
  activeItem: any;

  @ViewChild(DxDataGridComponent) dataGrid!: DxDataGridComponent;

  url = 'https://js.devexpress.com/Demos/Mvc/api/DataGridWebApi';

  requests: string[] = [];

  constructor(private readonly http: HttpClient
    ) {
    function isNotEmpty(value: any): boolean {
      return value !== undefined && value !== null && value !== '';
    }
    this.dataSource = new DataSource({
      key: 'OrderID',
      load: (loadOptions: any) => {
        let params: HttpParams = new HttpParams();
        [
          'skip',
          'take',
          'requireTotalCount',
          'requireGroupCount',
          'totalSummary',
          'group',
          'groupSummary',
        ].forEach((i) => {
          if (i in loadOptions && isNotEmpty(loadOptions[i])) 
          { params = params.set(i, JSON.stringify(loadOptions[i])); }
        });
        console.log('########', loadOptions);
        return lastValueFrom(http.get(`${this.url}/Orders`, {params: params, withCredentials: true})
          .pipe(
            tap((data: any) => {
              // this.activeItem = data.data[0]
            })
          ),
          
        ).then((data: any) => {
          this.activeItem = data.data[0];
          return {
            data: data.data,
            totalCount: data.totalCount
          }
        });
      }
    });
    
  }

  handleDelete() {
    this.sendRequest(`${this.url}/DeleteOrder`, 'DELETE', {
      key: this.selectedRowKeys[0],
    })
  }

  sendRequest(url: string, method = 'GET', data: any = {}): any {

    const httpParams = new HttpParams({ fromObject: data });
    const httpOptions = { withCredentials: true, body: httpParams };

    let result = this.http.delete(url, httpOptions)
    .pipe(
      tap(() => {
        // this.dataSource.reload();
      })
    );

    lastValueFrom(result)
      .then((data: any) => {
        this.dataSource.reload();
        return data;
      })
      .catch((e) => {
        throw e && e.error && e.error.Message;
      });
  }
}

@NgModule({
  imports: [
    BrowserModule,
    DxDataGridModule,
    HttpClientModule,
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
})
export class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule);
