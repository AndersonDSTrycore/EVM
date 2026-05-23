import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { ProjectsComponent } from './projects.component';
import { ProyectoService } from '../../../core/services/proyecto.service';
import { ActividadService } from '../../../core/services/actividad.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProyectoResponse } from '../../../core/models/proyecto.models';
import { ActividadResponse } from '../../../core/models/actividad.models';

// ─── Datos de prueba ─────────────────────────────────────────────────────────

const estadoActivo = { id: 1, codigo: 'ACTIVO', nombre: 'Activo', descripcion: '', activo: true };
const estadoCancelado = { id: 2, codigo: 'CANCELADO', nombre: 'Cancelado', descripcion: '', activo: true };

const proyectosMock: ProyectoResponse[] = [
  {
    id: 1, nombre: 'Portal web', descripcion: 'Descripción',
    estadoProyecto: estadoActivo, presupuestoTotal: 10000,
    fechaInicio: '2026-01-01', fechaFin: '2026-12-31',
    fechaCreacion: '2026-01-01T00:00:00', fechaModificacion: '2026-01-01T00:00:00',
  },
  {
    id: 2, nombre: 'App móvil', descripcion: 'App Android',
    estadoProyecto: estadoActivo, presupuestoTotal: 15000,
    fechaInicio: '2026-02-01', fechaFin: '2026-11-30',
    fechaCreacion: '2026-01-01T00:00:00', fechaModificacion: '2026-01-01T00:00:00',
  },
  {
    id: 3, nombre: 'Sistema ERP', descripcion: 'ERP',
    estadoProyecto: estadoCancelado, presupuestoTotal: 50000,
    fechaInicio: '2025-01-01', fechaFin: '2025-12-31',
    fechaCreacion: '2025-01-01T00:00:00', fechaModificacion: '2025-06-01T00:00:00',
  },
];

const actividadActivaMock: ActividadResponse = {
  id: 10, idProyecto: 1, nombreProyecto: 'Portal web',
  estadoActividad: { id: 1, codigo: 'ACTIVA', nombre: 'Activa', descripcion: '', activo: true },
  nombre: 'Diseño', bac: 5000,
  porcentajeAvancePlanificado: 40, porcentajeAvanceReal: 30,
  fechaInicio: '2026-01-01', fechaFin: '2026-06-30',
  fechaCreacion: '2026-01-01T00:00:00', fechaModificacion: '2026-01-01T00:00:00',
};

// ─── Suite principal ──────────────────────────────────────────────────────────

describe('ProjectsComponent', () => {
  let component: ProjectsComponent;
  let fixture: ComponentFixture<ProjectsComponent>;
  let proyectoServiceMock: jasmine.SpyObj<ProyectoService>;
  let actividadServiceMock: jasmine.SpyObj<ActividadService>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    proyectoServiceMock = jasmine.createSpyObj('ProyectoService', [
      'listarTodos', 'crear', 'actualizar', 'cancelar',
    ]);
    proyectoServiceMock.listarTodos.and.returnValue(of(proyectosMock));

    actividadServiceMock = jasmine.createSpyObj('ActividadService', ['listarPorProyecto']);
    actividadServiceMock.listarPorProyecto.and.returnValue(of([]));

    authServiceMock = jasmine.createSpyObj('AuthService', ['obtenerUsuario']);
    authServiceMock.obtenerUsuario.and.returnValue({ id: 1, rol: 'LIDER', nombre: 'Líder Test', correo: 'lider@test.com' });

    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ProjectsComponent],
      providers: [
        { provide: ProyectoService, useValue: proyectoServiceMock },
        { provide: ActividadService, useValue: actividadServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        ConfirmationService,
        MessageService,
        provideAnimationsAsync(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  // ─── Creación ──────────────────────────────────────────────────────────────

  it('debe crear el componente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ─── esLider ───────────────────────────────────────────────────────────────

  describe('esLider', () => {
    it('debe retornar true cuando el rol es LIDER', () => {
      authServiceMock.obtenerUsuario.and.returnValue({ id: 1, rol: 'LIDER', nombre: 'Test', correo: 'test@test.com' });
      expect(component.esLider).toBeTrue();
    });

    it('debe retornar false cuando el rol es COLABORADOR', () => {
      authServiceMock.obtenerUsuario.and.returnValue({ id: 2, rol: 'COLABORADOR', nombre: 'Test', correo: 'test@test.com' });
      expect(component.esLider).toBeFalse();
    });
  });

  // ─── esCancelado ───────────────────────────────────────────────────────────

  describe('esCancelado', () => {
    it('debe retornar true cuando estadoProyecto.codigo es CANCELADO', () => {
      expect(component.esCancelado(proyectosMock[2])).toBeTrue();
    });

    it('debe retornar false cuando estadoProyecto.codigo es ACTIVO', () => {
      expect(component.esCancelado(proyectosMock[0])).toBeFalse();
    });
  });

  // ─── proyectosFiltrados ────────────────────────────────────────────────────

  describe('proyectosFiltrados', () => {
    beforeEach(() => {
      component.proyectos = proyectosMock;
    });

    it('debe retornar todos los proyectos cuando el filtro está vacío', () => {
      component.filtroProyectos = '';
      expect(component.proyectosFiltrados.length).toBe(3);
    });

    it('debe retornar todos los proyectos cuando el filtro tiene solo espacios', () => {
      component.filtroProyectos = '   ';
      expect(component.proyectosFiltrados.length).toBe(3);
    });

    it('debe filtrar por nombre de forma insensible a mayúsculas', () => {
      component.filtroProyectos = 'portal';
      const resultado = component.proyectosFiltrados;
      expect(resultado.length).toBe(1);
      expect(resultado[0].nombre).toBe('Portal web');
    });

    it('debe filtrar por fragmento de nombre', () => {
      component.filtroProyectos = 'móvil';
      const resultado = component.proyectosFiltrados;
      expect(resultado.length).toBe(1);
      expect(resultado[0].id).toBe(2);
    });

    it('debe retornar arreglo vacío cuando no hay coincidencias', () => {
      component.filtroProyectos = 'xyznoexiste';
      expect(component.proyectosFiltrados.length).toBe(0);
    });
  });

  // ─── limpiarFiltroProyectos ────────────────────────────────────────────────

  describe('limpiarFiltroProyectos', () => {
    it('debe reiniciar filtroProyectos a cadena vacía', () => {
      component.filtroProyectos = 'portal';
      component.limpiarFiltroProyectos();
      expect(component.filtroProyectos).toBe('');
    });
  });

  // ─── obtenerSeveridadEstado ────────────────────────────────────────────────

  describe('obtenerSeveridadEstado', () => {
    it('debe retornar success para ACTIVO', () => {
      expect(component.obtenerSeveridadEstado('ACTIVO')).toBe('success');
    });

    it('debe retornar danger para CANCELADO', () => {
      expect(component.obtenerSeveridadEstado('CANCELADO')).toBe('danger');
    });

    it('debe retornar warn para PAUSADO', () => {
      expect(component.obtenerSeveridadEstado('PAUSADO')).toBe('warn');
    });

    it('debe retornar secondary para FINALIZADO', () => {
      expect(component.obtenerSeveridadEstado('FINALIZADO')).toBe('secondary');
    });
  });

  // ─── obtenerMenuAcciones ───────────────────────────────────────────────────

  describe('obtenerMenuAcciones', () => {
    const proyectoActivo = proyectosMock[0];
    const proyectoCancelado = proyectosMock[2];

    it('debe incluir "Ver actividades" para cualquier rol', () => {
      const items = component.obtenerMenuAcciones(proyectoActivo);
      expect(items.some((i) => i.label === 'Ver actividades')).toBeTrue();
    });

    it('debe retornar 3 ítems para LIDER', () => {
      authServiceMock.obtenerUsuario.and.returnValue({ id: 1, rol: 'LIDER', nombre: 'Test', correo: 'test@test.com' });
      const items = component.obtenerMenuAcciones(proyectoActivo);
      expect(items.length).toBe(3);
    });

    it('debe retornar 1 ítem para COLABORADOR', () => {
      authServiceMock.obtenerUsuario.and.returnValue({ id: 2, rol: 'COLABORADOR', nombre: 'Test', correo: 'test@test.com' });
      const items = component.obtenerMenuAcciones(proyectoActivo);
      expect(items.length).toBe(1);
    });

    it('debe deshabilitar "Editar proyecto" y "Cancelar proyecto" para proyecto cancelado', () => {
      authServiceMock.obtenerUsuario.and.returnValue({ id: 1, rol: 'LIDER', nombre: 'Test', correo: 'test@test.com' });
      const items = component.obtenerMenuAcciones(proyectoCancelado);
      const editar = items.find((i) => i.label === 'Editar proyecto');
      const cancelar = items.find((i) => i.label === 'Cancelar proyecto');
      expect(editar?.disabled).toBeTrue();
      expect(cancelar?.disabled).toBeTrue();
    });
  });

  // ─── confirmarCancelar – verificación de actividades activas ──────────────

  describe('confirmarCancelar', () => {
    it('NO debe abrir diálogo de confirmación si el proyecto tiene actividades activas', () => {
      actividadServiceMock.listarPorProyecto.and.returnValue(of([actividadActivaMock]));
      const confirmSpy = spyOn((component as any).confirmationService, 'confirm');
      component.confirmarCancelar(proyectosMock[0]);
      expect(confirmSpy).not.toHaveBeenCalled();
    });

    it('debe abrir diálogo de confirmación si no hay actividades activas', () => {
      actividadServiceMock.listarPorProyecto.and.returnValue(of([]));
      const confirmSpy = spyOn((component as any).confirmationService, 'confirm');
      component.confirmarCancelar(proyectosMock[0]);
      expect(confirmSpy).toHaveBeenCalled();
    });
  });

  // ─── ngOnInit ──────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('debe llamar a listarTodos y poblar el arreglo proyectos', () => {
      fixture.detectChanges();
      expect(proyectoServiceMock.listarTodos).toHaveBeenCalled();
      expect(component.proyectos.length).toBe(3);
    });
  });

  // ─── Formulario ────────────────────────────────────────────────────────────

  describe('formulario', () => {
    it('debe ser inválido cuando el campo nombre está vacío', () => {
      const ctrl = component.formulario.get('nombre')!;
      ctrl.setValue('');
      ctrl.markAsTouched();
      expect(ctrl.invalid).toBeTrue();
      expect(ctrl.hasError('required')).toBeTrue();
    });

    it('debe ser inválido cuando presupuestoTotal es null', () => {
      const ctrl = component.formulario.get('presupuestoTotal')!;
      ctrl.setValue(null);
      ctrl.markAsTouched();
      expect(ctrl.invalid).toBeTrue();
    });

    it('debe ser válido con todos los campos requeridos completos', () => {
      component.formulario.patchValue({
        nombre: 'Proyecto X',
        fechaInicio: new Date('2026-01-01'),
        fechaFin: new Date('2026-12-31'),
        presupuestoTotal: 10000,
      });
      expect(component.formulario.valid).toBeTrue();
    });
  });
});
