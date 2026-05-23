import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/auth/auth.service';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('el formulario debe ser inválido cuando está vacío', () => {
    expect(component.formulario.invalid).toBeTrue();
  });

  it('debe marcar campos como tocados al hacer submit con formulario inválido', () => {
    component.iniciarSesion();
    expect(component.formulario.get('correo')?.touched).toBeTrue();
    expect(component.formulario.get('contrasena')?.touched).toBeTrue();
  });

  it('debe llamar al servicio de login con credenciales válidas', () => {
    authServiceSpy.login.and.returnValue(of({
      token: 'test-token',
      tipo_token: 'Bearer',
      usuario: { id: 1, nombre: 'Test', correo: 'test@test.com', rol: 'LIDER' },
    }));

    component.formulario.setValue({ correo: 'test@test.com', contrasena: 'password' });
    component.iniciarSesion();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      correo: 'test@test.com',
      contrasena: 'password',
    });
  });

  it('debe mostrar mensaje de error 401 cuando las credenciales son inválidas', () => {
    authServiceSpy.login.and.returnValue(throwError(() => ({ status: 401 })));

    component.formulario.setValue({ correo: 'test@test.com', contrasena: 'wrong' });
    component.iniciarSesion();

    expect(component.mensajeError).toBe('Credenciales inválidas.');
  });

  it('correoInvalido debe ser verdadero si el correo está tocado y es inválido', () => {
    const control = component.formulario.get('correo');
    control?.markAsTouched();
    expect(component.correoInvalido).toBeTrue();
  });
});
