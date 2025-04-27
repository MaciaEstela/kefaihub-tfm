import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UserNewComponent } from './user-new/user-new.component';


@NgModule({
  declarations: [
    AdminComponent,
    UserListComponent,
    UserDetailComponent,
    UserNewComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    TranslateModule
  ]
})
export class AdminModule { }
