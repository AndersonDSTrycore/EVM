import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../../core/auth/auth.service';
import { provideRouter } from '@angular/router';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['obtenerUsuario']);
    authServiceSpy.obtenerUsuario.and.returnValue({
      id: 1,
      nombre: 'Líder Demo',
      correo: 'lider@evm.local',
      rol: 'LIDER',
    });

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe retornar el usuario autenticado', () => {
    expect(component.usuario?.nombre).toBe('Líder Demo');
    expect(component.usuario?.rol).toBe('LIDER');
  });

  it('debe renderizar el nombre del usuario', () => {
    const nombre = fixture.nativeElement.querySelector('.dashboard-nombre');
    expect(nombre?.textContent).toContain('Líder Demo');
  });

  it('debe renderizar el rol del usuario', () => {
    const rol = fixture.nativeElement.querySelector('.rol-badge');
    expect(rol?.textContent).toContain('LIDER');
  });
});
