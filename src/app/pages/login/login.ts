import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Data } from '../../services/data';

@Component({
  imports: [FormsModule, RouterLink],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private readonly data = inject(Data);
  private readonly router = inject(Router);

  usuario = '';
  clave = '';
  protected readonly error = signal('');

  ingresar(): void {
    if (!this.usuario.trim() || !this.clave) {
      this.error.set('Ingrese su usuario y contraseña.');
      return;
    }
    const r = this.data.login(this.usuario, this.clave);
    if (!r.ok) {
      this.error.set(r.mensaje);
      return;
    }
    this.router.navigateByUrl('/inicio');
  }
}
