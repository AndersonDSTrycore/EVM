import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopbarComponent } from './topbar.component';
import { AuthService } from '../../../core/auth/auth.service';
import { provideRouter } from '@angular/router';

describe('TopbarComponent', () => {
  let component: TopbarComponent;
  let fixture: ComponentFixture<TopbarComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout', 'obtenerUsuario']);
    authServiceSpy.obtenerUsuario.and.returnValue({
      id: 1,
      nombre: 'Líder Demo',
      correo: 'lider@evm.local',
      rol: 'LIDER',
    });

    await TestBed.configureTestingModule({
      imports: [TopbarComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TopbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe mostrar el nombre del usuario autenticado', () => {
    expect(component.nombreUsuario).toBe('Líder Demo');
  });

  it('debe mostrar el rol del usuario', () => {
    expect(component.rolUsuario).toBe('LIDER');
  });

  it('debe llamar logout al hacer clic en salir', () => {
    component.cerrarSesion();
    expect(authServiceSpy.logout).toHaveBeenCalled();
  });

  it('debe emitir toggleSidebar al hacer clic en hamburguesa', () => {
    spyOn(component.toggleSidebar, 'emit');
    const btn = fixture.nativeElement.querySelector('.topbar-hamburger');
    btn.click();
    expect(component.toggleSidebar.emit).toHaveBeenCalled();
  });
});
