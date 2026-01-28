import { Routes } from '@angular/router';
import { Home } from './component/shared/home/home';
import { CuotaPlist } from './component/cuota/cuota-plist/cuota-plist';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'cuota', component: CuotaPlist}
];
