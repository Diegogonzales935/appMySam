import { Component, inject, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Data } from '../../services/data';

@Component({
  imports: [RouterLink],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  private readonly data = inject(Data);
  private readonly router = inject(Router);

  readonly toggleMenu = output<void>();
  protected readonly usuario = this.data.usuarioActual;

  cerrarSesion(): void {
    this.data.logout();
    this.router.navigateByUrl('/login');
  }
}
