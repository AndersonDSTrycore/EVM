import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { of } from 'rxjs';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { AssignUsersComponent } from './assign-users.component';
import { AsignacionActividadService } from '../../../../core/services/asignacion-actividad.service';
import { MessageService } from 'primeng/api';
import {
  AsignacionActividadResponse,
  EstadoAsignacion,
  UsuarioDisponibleResponse,
} from '../../../../core/models/asignacion.models';
import { ActividadResponse } from '../../../../core/models/actividad.models';

// ─── Datos de prueba ─────────────────────────────────────────────────────────

const estadoActiva: EstadoAsignacion = {
  id: 1, codigo: 'ACTIVA', nombre: 'Activa', descripcion: '', activo: true,
};
const estadoRetirada: EstadoAsignacion = {
  id: 2, codigo: 'RETIRADA', nombre: 'Retirada', descripcion: '', activo: true,
};

const actividadMock: ActividadResponse = {
  id: 5, idProyecto: 1, nombreProyecto: 'P1',
  estadoActividad: { id: 1, codigo: 'ACTIVA', nombre: 'Activa', descripcion: '', activo: true },
  nombre: 'Actividad Test',
  bac: 5000, porcentajeAvancePlanificado: 40, porcentajeAvanceReal: 30,
  fechaInicio: '2026-01-01', fechaFin: '2026-06-30',
  fechaCreacion: '2026-01-01T00:00:00', fechaModificacion: '2026-01-01T00:00:00',
};

const asignacionActivaMock: AsignacionActividadResponse = {
  id: 10, idActividad: 5, nombreActividad: 'Actividad Test',
  idUsuario: 1, nombreUsuario: 'Usuario Activo',
  correoUsuario: 'activo@test.com', cargoUsuario: 'Developer',
  estadoAsignacion: estadoActiva,
  fechaAsignacion: '2026-01-01', fechaRetiro: null,
  fechaCreacion: '2026-01-01T00:00:00', fechaModificacion: '2026-01-01T00:00:00',
};

const asignacionRetiradaMock: AsignacionActividadResponse = {
  ...asignacionActivaMock,
  id: 11,
  estadoAsignacion: estadoRetirada,
  fechaRetiro: '2026-02-01',
};

const usuarioDisponibleMock: UsuarioDisponibleResponse = {
  id: 99, nombre: 'Nuevo Usuario', correo: 'nuevo@test.com',
  cargo: 'Tester', rol: 'COLABORADOR',
};

const otroUsuarioMock: UsuarioDisponibleResponse = {
  id: 100, nombre: 'Otro Usuario', correo: 'otro@test.com',
  cargo: 'Developer', rol: 'COLABORADOR',
};

// ─── Suite principal ──────────────────────────────────────────────────────────

describe('AssignUsersComponent', () => {
  let component: AssignUsersComponent;
  let fixture: ComponentFixture<AssignUsersComponent>;
  let asignacionServiceMock: jasmine.SpyObj<AsignacionActividadService>;

  beforeEach(async () => {
    asignacionServiceMock = jasmine.createSpyObj('AsignacionActividadService', [
      'listarPorActividad',
      'listarUsuariosDisponibles',
      'asignar',
      'retirar',
    ]);
    asignacionServiceMock.listarPorActividad.and.returnValue(of([asignacionActivaMock]));
    asignacionServiceMock.listarUsuariosDisponibles.and.returnValue(of([usuarioDisponibleMock]));

    await TestBed.configureTestingModule({
      imports: [AssignUsersComponent],
      providers: [
        { provide: AsignacionActividadService, useValue: asignacionServiceMock },
        MessageService,
        provideAnimationsAsync(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignUsersComponent);
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

  it('debe inicializar con arreglos vacíos', () => {
    expect(component.asignaciones).toEqual([]);
    expect(component.disponibles).toEqual([]);
    expect(component.seleccionados).toEqual([]);
  });

  // ─── estaSeleccionado ──────────────────────────────────────────────────────

  describe('estaSeleccionado', () => {
    it('debe retornar false cuando el usuario no está en seleccionados', () => {
      component.seleccionados = [];
      expect(component.estaSeleccionado(usuarioDisponibleMock)).toBeFalse();
    });

    it('debe retornar true cuando el usuario ya está seleccionado', () => {
      component.seleccionados = [usuarioDisponibleMock];
      expect(component.estaSeleccionado(usuarioDisponibleMock)).toBeTrue();
    });

    it('debe identificar por id, no por referencia de objeto', () => {
      component.seleccionados = [{ ...usuarioDisponibleMock }];
      expect(component.estaSeleccionado(usuarioDisponibleMock)).toBeTrue();
    });
  });

  // ─── toggleSeleccion ───────────────────────────────────────────────────────

  describe('toggleSeleccion', () => {
    it('debe agregar el usuario al arreglo cuando no está seleccionado', () => {
      component.seleccionados = [];
      component.toggleSeleccion(usuarioDisponibleMock);
      expect(component.seleccionados.length).toBe(1);
      expect(component.seleccionados[0].id).toBe(usuarioDisponibleMock.id);
    });

    it('debe eliminar el usuario del arreglo cuando ya está seleccionado', () => {
      component.seleccionados = [usuarioDisponibleMock];
      component.toggleSeleccion(usuarioDisponibleMock);
      expect(component.seleccionados.length).toBe(0);
    });

    it('debe mantener otros seleccionados al eliminar uno', () => {
      component.seleccionados = [usuarioDisponibleMock, otroUsuarioMock];
      component.toggleSeleccion(usuarioDisponibleMock);
      expect(component.seleccionados.length).toBe(1);
      expect(component.seleccionados[0].id).toBe(otroUsuarioMock.id);
    });

    it('debe permitir seleccionar múltiples usuarios independientemente', () => {
      component.seleccionados = [];
      component.toggleSeleccion(usuarioDisponibleMock);
      component.toggleSeleccion(otroUsuarioMock);
      expect(component.seleccionados.length).toBe(2);
    });
  });

  // ─── esActiva ──────────────────────────────────────────────────────────────

  describe('esActiva', () => {
    it('debe retornar true cuando estadoAsignacion.codigo es ACTIVA', () => {
      expect(component.esActiva(asignacionActivaMock)).toBeTrue();
    });

    it('debe retornar false cuando estadoAsignacion.codigo es RETIRADA', () => {
      expect(component.esActiva(asignacionRetiradaMock)).toBeFalse();
    });
  });

  // ─── obtenerSeveridadEstado ────────────────────────────────────────────────

  describe('obtenerSeveridadEstado', () => {
    it('debe retornar success para ACTIVA', () => {
      expect(component.obtenerSeveridadEstado('ACTIVA')).toBe('success');
    });

    it('debe retornar danger para RETIRADA', () => {
      expect(component.obtenerSeveridadEstado('RETIRADA')).toBe('danger');
    });

    it('debe retornar secondary para un código desconocido', () => {
      expect(component.obtenerSeveridadEstado('OTRO')).toBe('secondary');
    });

    it('debe retornar secondary para cadena vacía', () => {
      expect(component.obtenerSeveridadEstado('')).toBe('secondary');
    });
  });

  // ─── ngOnChanges ───────────────────────────────────────────────────────────

  describe('ngOnChanges', () => {
    it('debe llamar a cargarDatos cuando visible cambia de false a true con actividad', () => {
      spyOn(component, 'cargarDatos');
      component.actividad = actividadMock;
      component.visible = true;
      component.ngOnChanges({
        visible: new SimpleChange(false, true, false),
      });
      expect(component.cargarDatos).toHaveBeenCalled();
    });

    it('debe reiniciar seleccionados cuando visible cambia a true', () => {
      component.seleccionados = [usuarioDisponibleMock];
      component.actividad = actividadMock;
      component.visible = true;
      component.ngOnChanges({
        visible: new SimpleChange(false, true, false),
      });
      expect(component.seleccionados.length).toBe(0);
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

    it('debe limpiar asignaciones cuando visible cambia a false', () => {
      component.asignaciones = [asignacionActivaMock];
      component.visible = false;
      component.ngOnChanges({
        visible: new SimpleChange(true, false, false),
      });
      expect(component.asignaciones.length).toBe(0);
    });

    it('debe limpiar disponibles cuando visible cambia a false', () => {
      component.disponibles = [usuarioDisponibleMock];
      component.visible = false;
      component.ngOnChanges({
        visible: new SimpleChange(true, false, false),
      });
      expect(component.disponibles.length).toBe(0);
    });

    it('debe limpiar seleccionados cuando visible cambia a false', () => {
      component.seleccionados = [usuarioDisponibleMock];
      component.visible = false;
      component.ngOnChanges({
        visible: new SimpleChange(true, false, false),
      });
      expect(component.seleccionados.length).toBe(0);
    });
  });

  // ─── cargarDatos ───────────────────────────────────────────────────────────

  describe('cargarDatos', () => {
    it('debe llamar a listarPorActividad del servicio', () => {
      component.actividad = actividadMock;
      component.cargarDatos();
      expect(asignacionServiceMock.listarPorActividad).toHaveBeenCalledWith(actividadMock.id);
    });

    it('debe llamar a listarUsuariosDisponibles del servicio', () => {
      component.actividad = actividadMock;
      component.cargarDatos();
      expect(asignacionServiceMock.listarUsuariosDisponibles).toHaveBeenCalledWith(actividadMock.id);
    });
  });
});
