import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header/header';
import { Sidebar } from './sidebar/sidebar';
import { Footer } from './footer/footer';

@Component({
  imports: [RouterOutlet, Header, Sidebar, Footer],
  selector: 'app-layout',
  styleUrl: './layout.css',
  templateUrl: './layout.html',
})
export class Layout {
  protected readonly menuAbierto = signal(false);
}
