import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { of } from 'rxjs';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { RegistroHorasComponent } from './registro-horas.component';
import { RegistroHorasService } from '../../../../core/services/registro-horas.service';
import { AsignacionActividadService } from '../../../../core/services/asignacion-actividad.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { MessageService } from 'primeng/api';
import { RegistroHorasResponse } from '../../../../core/models/registro-horas.models';
import { ActividadResponse } from '../../../../core/models/actividad.models';
import { AsignacionActividadResponse } from '../../../../core/models/asignacion.models';

// ─── Datos de prueba ─────────────────────────────────────────────────────────

const actividadMock: ActividadResponse = {
  id: 5, idProyecto: 1, nombreProyecto: 'P1',
  estadoActividad: { id: 1, codigo: 'ACTIVA', nombre: 'Activa', descripcion: '', activo: true },
  nombre: 'Actividad Test',
  bac: 5000, porcentajeAvancePlanificado: 40, porcentajeAvanceReal: 30,
  fechaInicio: '2026-01-01', fechaFin: '2026-06-30',
  fechaCreacion: '2026-01-01T00:00:00', fechaModificacion: '2026-01-01T00:00:00',
};

const registroMock1: RegistroHorasResponse = {
  id: 1, idActividad: 5, nombreActividad: 'Actividad Test',
  idUsuario: 1, nombreUsuario: 'Líder Test',
  correoUsuario: 'lider@test.com', cargoUsuario: 'Líder',
  idUsuarioRegistra: 1, nombreUsuarioRegistra: 'Líder Test',
  fechaTrabajo: '2026-02-01',
  horasTrabajadas: 8,
  valorHoraHistorico: 50000,
  costoTotal: 400000,
  fechaCreacion: '2026-02-01T00:00:00', fechaModificacion: '2026-02-01T00:00:00',
};

const registroMock2: RegistroHorasResponse = {
  ...registroMock1,
  id: 2,
  horasTrabajadas: 4,
  costoTotal: 200000,
};

const asignacionActivaMock: AsignacionActividadResponse = {
  id: 10, idActividad: 5, nombreActividad: 'Actividad Test',
  idUsuario: 1, nombreUsuario: 'Usuario Activo',
  correoUsuario: 'activo@test.com', cargoUsuario: 'Developer',
  estadoAsignacion: { id: 1, codigo: 'ACTIVA', nombre: 'Activa', descripcion: '', activo: true },
  fechaAsignacion: '2026-01-01', fechaRetiro: null,
  fechaCreacion: '2026-01-01T00:00:00', fechaModificacion: '2026-01-01T00:00:00',
};

// ─── Suite principal ──────────────────────────────────────────────────────────

describe('RegistroHorasComponent', () => {
  let component: RegistroHorasComponent;
  let fixture: ComponentFixture<RegistroHorasComponent>;
  let registroHorasServiceMock: jasmine.SpyObj<RegistroHorasService>;
  let asignacionServiceMock: jasmine.SpyObj<AsignacionActividadService>;
  let authServiceMock: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    registroHorasServiceMock = jasmine.createSpyObj('RegistroHorasService', [
      'listarPorActividad', 'registrar',
    ]);
    registroHorasServiceMock.listarPorActividad.and.returnValue(of([registroMock1, registroMock2]));

    asignacionServiceMock = jasmine.createSpyObj('AsignacionActividadService', [
      'listarPorActividad',
    ]);
    asignacionServiceMock.listarPorActividad.and.returnValue(of([asignacionActivaMock]));

    authServiceMock = jasmine.createSpyObj('AuthService', ['obtenerUsuario']);
    authServiceMock.obtenerUsuario.and.returnValue({ id: 1, rol: 'LIDER', nombre: 'Líder Test', correo: 'lider@test.com' });

    await TestBed.configureTestingModule({
      imports: [RegistroHorasComponent],
      providers: [
        { provide: RegistroHorasService, useValue: registroHorasServiceMock },
        { provide: AsignacionActividadService, useValue: asignacionServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        MessageService,
        provideAnimationsAsync(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroHorasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  // ─── Creación ──────────────────────────────────────────────────────────────

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar con el formulario y arreglos vacíos', () => {
    expect(component.formulario).toBeDefined();
    expect(component.registros).toEqual([]);
    expect(component.asignacionesActivas).toEqual([]);
  });

  // ─── esLider ───────────────────────────────────────────────────────────────

  describe('esLider', () => {
    it('debe retornar true cuando el rol del usuario es LIDER', () => {
      authServiceMock.obtenerUsuario.and.returnValue({ id: 1, rol: 'LIDER', nombre: 'Test', correo: 'test@test.com' });
      expect(component.esLider).toBeTrue();
    });

    it('debe retornar false cuando el rol del usuario es COLABORADOR', () => {
      authServiceMock.obtenerUsuario.and.returnValue({ id: 2, rol: 'COLABORADOR', nombre: 'Test', correo: 'test@test.com' });
      expect(component.esLider).toBeFalse();
    });
  });

  // ─── totalHoras ────────────────────────────────────────────────────────────

  describe('totalHoras', () => {
    it('debe retornar 0 cuando no hay registros', () => {
      component.registros = [];
      expect(component.totalHoras).toBe(0);
    });

    it('debe sumar las horas de todos los registros (8 + 4 = 12)', () => {
      component.registros = [registroMock1, registroMock2];
      expect(component.totalHoras).toBe(12);
    });

    it('debe retornar el valor de un único registro', () => {
      component.registros = [registroMock1];
      expect(component.totalHoras).toBe(8);
    });
  });

  // ─── totalCosto ────────────────────────────────────────────────────────────

  describe('totalCosto', () => {
    it('debe retornar 0 cuando no hay registros', () => {
      component.registros = [];
      expect(component.totalCosto).toBe(0);
    });

    it('debe sumar los costos de todos los registros (400000 + 200000 = 600000)', () => {
      component.registros = [registroMock1, registroMock2];
      expect(component.totalCosto).toBe(600000);
    });

    it('debe retornar el costo de un único registro', () => {
      component.registros = [registroMock1];
      expect(component.totalCosto).toBe(400000);
    });
  });

  // ─── Validaciones del formulario ───────────────────────────────────────────

  describe('formulario – campo horasTrabajadas', () => {
    it('debe ser inválido cuando es null (campo requerido)', () => {
      const ctrl = component.formulario.get('horasTrabajadas')!;
      ctrl.setValue(null);
      ctrl.markAsTouched();
      expect(ctrl.invalid).toBeTrue();
      expect(ctrl.hasError('required')).toBeTrue();
    });

    it('debe ser inválido cuando el valor es 0 (mínimo permitido es 1)', () => {
      const ctrl = component.formulario.get('horasTrabajadas')!;
      ctrl.setValue(0);
      ctrl.markAsTouched();
      expect(ctrl.invalid).toBeTrue();
      expect(ctrl.hasError('min')).toBeTrue();
    });

    it('debe ser inválido cuando el valor es negativo', () => {
      const ctrl = component.formulario.get('horasTrabajadas')!;
      ctrl.setValue(-1);
      ctrl.markAsTouched();
      expect(ctrl.invalid).toBeTrue();
      expect(ctrl.hasError('min')).toBeTrue();
    });

    it('debe ser válido con el valor mínimo de 1', () => {
      const ctrl = component.formulario.get('horasTrabajadas')!;
      ctrl.setValue(1);
      expect(ctrl.valid).toBeTrue();
    });

    it('debe ser válido con valores positivos mayores a 1', () => {
      const ctrl = component.formulario.get('horasTrabajadas')!;
      ctrl.setValue(8);
      expect(ctrl.valid).toBeTrue();
    });
  });

  describe('formulario – campo fechaTrabajo', () => {
    it('debe ser inválido cuando está vacío (campo requerido)', () => {
      const ctrl = component.formulario.get('fechaTrabajo')!;
      ctrl.setValue(null);
      ctrl.markAsTouched();
      expect(ctrl.invalid).toBeTrue();
      expect(ctrl.hasError('required')).toBeTrue();
    });

    it('debe ser válido con una fecha correcta', () => {
      const ctrl = component.formulario.get('fechaTrabajo')!;
      ctrl.setValue(new Date('2026-03-15'));
      expect(ctrl.valid).toBeTrue();
    });
  });

  describe('formulario – campo idUsuario', () => {
    it('debe ser inválido cuando no hay usuario seleccionado (campo requerido)', () => {
      const ctrl = component.formulario.get('idUsuario')!;
      ctrl.setValue(null);
      ctrl.markAsTouched();
      expect(ctrl.invalid).toBeTrue();
      expect(ctrl.hasError('required')).toBeTrue();
    });

    it('debe ser válido cuando se asigna un id de usuario', () => {
      const ctrl = component.formulario.get('idUsuario')!;
      ctrl.setValue(1);
      expect(ctrl.valid).toBeTrue();
    });
  });

  describe('formulario – estado general', () => {
    it('debe ser inválido cuando todos los campos requeridos están vacíos', () => {
      component.formulario.reset();
      expect(component.formulario.invalid).toBeTrue();
    });

    it('debe ser válido cuando se completan todos los campos requeridos', () => {
      component.formulario.patchValue({
        idUsuario: 1,
        fechaTrabajo: new Date('2026-03-15'),
        horasTrabajadas: 8,
      });
      expect(component.formulario.valid).toBeTrue();
    });
  });

  // ─── ngOnChanges ───────────────────────────────────────────────────────────

  describe('ngOnChanges', () => {
    it('debe llamar a cargarDatos cuando visible cambia a true con actividad', () => {
      spyOn(component, 'cargarDatos');
      component.actividad = actividadMock;
      component.visible = true;
      component.ngOnChanges({
        visible: new SimpleChange(false, true, false),
      });
      expect(component.cargarDatos).toHaveBeenCalled();
    });

    it('NO debe llamar a cargarDatos cuando visible cambia a true sin actividad', () => {
      spyOn(component, 'cargarDatos');
      component.actividad = null;
      component.visible = true;
      component.ngOnChanges({
        visible: new SimpleChange(false, true, false),
      });
      expect(component.cargarDatos).not.toHaveBeenCalled();
    });

    it('debe reiniciar los registros cuando visible cambia a false', () => {
      component.registros = [registroMock1, registroMock2];
      component.visible = false;
      component.ngOnChanges({
        visible: new SimpleChange(true, false, false),
      });
      expect(component.registros.length).toBe(0);
    });

    it('debe reiniciar asignacionesActivas cuando visible cambia a false', () => {
      component.asignacionesActivas = [asignacionActivaMock];
      component.visible = false;
      component.ngOnChanges({
        visible: new SimpleChange(true, false, false),
      });
      expect(component.asignacionesActivas.length).toBe(0);
    });

    it('debe reiniciar el formulario cuando visible cambia a false', () => {
      component.formulario.patchValue({ horasTrabajadas: 8 });
      component.visible = false;
      component.ngOnChanges({
        visible: new SimpleChange(true, false, false),
      });
      expect(component.formulario.get('horasTrabajadas')?.value).toBeNull();
    });
  });

  // ─── cargarDatos ───────────────────────────────────────────────────────────

  describe('cargarDatos', () => {
    it('debe llamar a listarPorActividad (registros) con el id de la actividad', () => {
      component.actividad = actividadMock;
      component.cargarDatos();
      expect(registroHorasServiceMock.listarPorActividad).toHaveBeenCalledWith(actividadMock.id);
    });

    it('debe llamar a listarPorActividad (asignaciones) cuando es LIDER', () => {
      authServiceMock.obtenerUsuario.and.returnValue({ id: 1, rol: 'LIDER', nombre: 'Test', correo: 'test@test.com' });
      component.actividad = actividadMock;
      component.cargarDatos();
      expect(asignacionServiceMock.listarPorActividad).toHaveBeenCalledWith(actividadMock.id);
    });

    it('NO debe llamar a listarPorActividad (asignaciones) cuando es COLABORADOR', () => {
      authServiceMock.obtenerUsuario.and.returnValue({ id: 2, rol: 'COLABORADOR', nombre: 'Test', correo: 'test@test.com' });
      // Resetear conteo de llamadas
      asignacionServiceMock.listarPorActividad.calls.reset();
      component.actividad = actividadMock;
      component.cargarDatos();
      expect(asignacionServiceMock.listarPorActividad).not.toHaveBeenCalled();
    });
  });
});
