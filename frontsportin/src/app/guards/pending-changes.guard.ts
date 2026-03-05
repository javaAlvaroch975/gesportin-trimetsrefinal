import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent } from '../component/shared/confirm-dialog/confirm-dialog.component';

export interface CanComponentDeactivate {
  canDeactivate?: () => Observable<boolean> | Promise<boolean> | boolean;
  // fallback: component may expose a FormGroup named blogForm
}

@Injectable({ providedIn: 'root' })
export class PendingChangesGuard implements CanDeactivate<CanComponentDeactivate> {
  constructor(private dialog: MatDialog) {}

  canDeactivate(component: CanComponentDeactivate): Observable<boolean> | Promise<boolean> | boolean {
    // prefer explicit canDeactivate on the component
    if (component && component.canDeactivate) {
      return component.canDeactivate();
    }

    // fallback: check blogForm.dirty
    const form = (component as any)?.blogForm;
    if (form && form.dirty) {
      const ref = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Cambios sin guardar',
          message: 'Hay cambios sin guardar. ¿Desea salir sin guardar los cambios?'
        }
      });
      return ref.afterClosed();
    }

    return true;
  }
}
