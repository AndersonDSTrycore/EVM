import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayoutComponent } from './main-layout.component';
import { AuthService } from '../../../core/auth/auth.service';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['obtenerUsuario', 'logout']);
    authSpy.obtenerUsuario.and.returnValue({ id: 1, nombre: 'Test', correo: 'a@b.com', rol: 'LIDER' });

    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: AuthService, useValue: authSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('el sidebar debe iniciar expandido', () => {
    expect(component.sidebarColapsado).toBeFalse();
  });

  it('debe alternar el estado del sidebar', () => {
    component.sidebarColapsado = !component.sidebarColapsado;
    expect(component.sidebarColapsado).toBeTrue();
  });
});
