import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { ActivitiesComponent } from './activities.component';
import { ActividadService } from '../../../core/services/actividad.service';
import { ProyectoService } from '../../../core/services/proyecto.service';
import { AuthService } from '../../../core/auth/auth.service';
import { IndicadorEvmService } from '../../../core/services/indicador-evm.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActividadResponse } from '../../../core/models/actividad.models';
import { EstadoEvm, IndicadoresEvmProyectoResponse } from '../../../core/models/indicador-evm.models';

// ─── Datos de prueba ─────────────────────────────────────────────────────────

const estadoActiva = { id: 1, codigo: 'ACTIVA', nombre: 'Activa', descripcion: '', activo: true };
const estadoCancelada = { id: 2, codigo: 'CANCELADA', nombre: 'Cancelada', descripcion: '', activo: true };

const actividadesMock: ActividadResponse[] = [
  {
    id: 1, idProyecto: 1, nombreProyecto: 'P1',
    estadoActividad: estadoActiva,
    nombre: 'Diseño UI',
    bac: 5000, porcentajeAvancePlanificado: 40, porcentajeAvanceReal: 30,
    fechaInicio: '2026-01-01', fechaFin: '2026-06-30',
    fechaCreacion: '2026-01-01T00:00:00', fechaModificacion: '2026-01-01T00:00:00',
  },
  {
    id: 2, idProyecto: 1, nombreProyecto: 'P1',
    estadoActividad: estadoActiva,
    nombre: 'Desarrollo backend',
    bac: 8000, porcentajeAvancePlanificado: 60, porcentajeAvanceReal: 55,
    fechaInicio: '2026-01-15', fechaFin: '2026-07-15',
    fechaCreacion: '2026-01-01T00:00:00', fechaModificacion: '2026-01-01T00:00:00',
  },
  {
    id: 3, idProyecto: 1, nombreProyecto: 'P1',
    estadoActividad: estadoCancelada,
    nombre: 'Testing QA',
    bac: 3000, porcentajeAvancePlanificado: 20, porcentajeAvanceReal: 0,
    fechaInicio: '2026-02-01', fechaFin: '2026-08-01',
    fechaCreacion: '2026-01-01T00:00:00', fechaModificacion: '2026-01-01T00:00:00',
  },
];

const indicadoresMock: IndicadoresEvmProyectoResponse = {
  idProyecto: 1,
  nombreProyecto: 'Proyecto Test',
  filtroAplicado: null,
  cantidadActividades: 2,
  bac: 10000, pv: 5000, ev: 4500, ac: 4000,
  cv: 500, sv: -500,
  cpi: 1.125, spi: 0.9,
  eac: 8888.89, vac: 1111.11,
  estadoCosto: 'BIEN' as EstadoEvm,
  estadoCronograma: 'RIESGO' as EstadoEvm,
  interpretacionCosto: 'Por debajo del presupuesto',
  interpretacionCronograma: 'Levemente atrasado',
  actividades: [],
};

// ─── Suite principal ──────────────────────────────────────────────────────────

describe('ActivitiesComponent', () => {
  let component: ActivitiesComponent;
  let fixture: ComponentFixture<ActivitiesComponent>;
  let actividadServiceMock: jasmine.SpyObj<ActividadService>;
  let proyectoServiceMock: jasmine.SpyObj<ProyectoService>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let indicadorEvmServiceMock: jasmine.SpyObj<IndicadorEvmService>;

  beforeEach(async () => {
    actividadServiceMock = jasmine.createSpyObj('ActividadService', [
      'listarPorProyecto', 'crear', 'actualizar', 'cancelar',
    ]);
    actividadServiceMock.listarPorProyecto.and.returnValue(of(actividadesMock));

    proyectoServiceMock = jasmine.createSpyObj('ProyectoService', ['obtenerPorId', 'listarTodos']);
    proyectoServiceMock.obtenerPorId.and.returnValue(of({ id: 1, nombre: 'Proyecto Test' } as any));

    authServiceMock = jasmine.createSpyObj('AuthService', ['obtenerUsuario']);
    authServiceMock.obtenerUsuario.and.returnValue({ id: 1, rol: 'LIDER', nombre: 'Líder Test', correo: 'lider@test.com' });

    indicadorEvmServiceMock = jasmine.createSpyObj('IndicadorEvmService', [
      'obtenerIndicadoresProyecto',
    ]);
    indicadorEvmServiceMock.obtenerIndicadoresProyecto.and.returnValue(of(indicadoresMock));

    await TestBed.configureTestingModule({
      imports: [ActivitiesComponent],
      providers: [
        { provide: ActividadService, useValue: actividadServiceMock },
        { provide: ProyectoService, useValue: proyectoServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: IndicadorEvmService, useValue: indicadorEvmServiceMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: (_k: string) => '1' } } },
        },
        ConfirmationService,
        MessageService,
        provideAnimationsAsync(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivitiesComponent);
    component = fixture.componentInstance;
    // No se llama a detectChanges aquí para poder configurar mocks antes en cada test
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

  // ─── actividadesFiltradas ──────────────────────────────────────────────────

  describe('actividadesFiltradas', () => {
    beforeEach(() => {
      component.actividades = actividadesMock;
    });

    it('debe retornar todas las actividades cuando el filtro está vacío', () => {
      component.filtroIndicadores = '';
      expect(component.actividadesFiltradas.length).toBe(3);
    });

    it('debe retornar todas las actividades cuando el filtro tiene solo espacios', () => {
      component.filtroIndicadores = '   ';
      expect(component.actividadesFiltradas.length).toBe(3);
    });

    it('debe filtrar por nombre de forma insensible a mayúsculas', () => {
      component.filtroIndicadores = 'diseño';
      const resultado = component.actividadesFiltradas;
      expect(resultado.length).toBe(1);
      expect(resultado[0].nombre).toBe('Diseño UI');
    });

    it('debe filtrar por fragmento de nombre', () => {
      component.filtroIndicadores = 'backend';
      const resultado = component.actividadesFiltradas;
      expect(resultado.length).toBe(1);
      expect(resultado[0].id).toBe(2);
    });

    it('debe filtrar por ID de actividad', () => {
      component.filtroIndicadores = '3';
      const resultado = component.actividadesFiltradas;
      expect(resultado.some((a) => a.id === 3)).toBeTrue();
    });

    it('debe retornar arreglo vacío cuando no hay coincidencias', () => {
      component.filtroIndicadores = 'xyznoexiste';
      expect(component.actividadesFiltradas.length).toBe(0);
    });
  });

  // ─── limpiarFiltro ─────────────────────────────────────────────────────────

  describe('limpiarFiltro', () => {
    it('debe reiniciar filtroIndicadores a cadena vacía', () => {
      component.filtroIndicadores = 'diseño';
      component.limpiarFiltro();
      expect(component.filtroIndicadores).toBe('');
    });
  });

  // ─── esCancelada ───────────────────────────────────────────────────────────

  describe('esCancelada', () => {
    it('debe retornar true cuando estadoActividad.codigo es CANCELADA', () => {
      expect(component.esCancelada(actividadesMock[2])).toBeTrue();
    });

    it('debe retornar false cuando estadoActividad.codigo es ACTIVA', () => {
      expect(component.esCancelada(actividadesMock[0])).toBeFalse();
    });
  });

  // ─── obtenerMenuAcciones ───────────────────────────────────────────────────

  describe('obtenerMenuAcciones', () => {
    const actividadActiva = actividadesMock[0];
    const actividadCancelada = actividadesMock[2];

    it('debe retornar 5 ítems para LIDER con actividad activa', () => {
      authServiceMock.obtenerUsuario.and.returnValue({ id: 1, rol: 'LIDER', nombre: 'Test', correo: 'test@test.com' });
      const items = component.obtenerMenuAcciones(actividadActiva);
      expect(items.length).toBe(5);
    });

    it('debe incluir "Ver estadísticas" como primer ítem para LIDER', () => {
      authServiceMock.obtenerUsuario.and.returnValue({ id: 1, rol: 'LIDER', nombre: 'Test', correo: 'test@test.com' });
      const items = component.obtenerMenuAcciones(actividadActiva);
      expect(items[0].label).toBe('Ver estadísticas');
    });

    it('debe incluir los 5 ítems esperados para LIDER', () => {
      authServiceMock.obtenerUsuario.and.returnValue({ id: 1, rol: 'LIDER', nombre: 'Test', correo: 'test@test.com' });
      const etiquetas = component.obtenerMenuAcciones(actividadActiva).map((i) => i.label);
      expect(etiquetas).toContain('Ver estadísticas');
      expect(etiquetas).toContain('Editar actividad');
      expect(etiquetas).toContain('Asignar usuarios');
      expect(etiquetas).toContain('Reporte de horas');
      expect(etiquetas).toContain('Cancelar actividad');
    });

    it('debe retornar 1 ítem "Registrar horas" para COLABORADOR', () => {
      authServiceMock.obtenerUsuario.and.returnValue({ id: 2, rol: 'COLABORADOR', nombre: 'Test', correo: 'test@test.com' });
      const items = component.obtenerMenuAcciones(actividadActiva);
      expect(items.length).toBe(1);
      expect(items[0].label).toBe('Registrar horas');
    });

    it('debe deshabilitar "Editar actividad" y "Cancelar actividad" para actividad cancelada', () => {
      authServiceMock.obtenerUsuario.and.returnValue({ id: 1, rol: 'LIDER', nombre: 'Test', correo: 'test@test.com' });
      const items = component.obtenerMenuAcciones(actividadCancelada);
      const editar = items.find((i) => i.label === 'Editar actividad');
      const cancelar = items.find((i) => i.label === 'Cancelar actividad');
      expect(editar?.disabled).toBeTrue();
      expect(cancelar?.disabled).toBeTrue();
    });

    it('debe deshabilitar "Asignar usuarios" para actividad cancelada', () => {
      authServiceMock.obtenerUsuario.and.returnValue({ id: 1, rol: 'LIDER', nombre: 'Test', correo: 'test@test.com' });
      const items = component.obtenerMenuAcciones(actividadCancelada);
      const asignar = items.find((i) => i.label === 'Asignar usuarios');
      expect(asignar?.disabled).toBeTrue();
    });
  });

  // ─── obtenerClaseEstado ────────────────────────────────────────────────────

  describe('obtenerClaseEstado', () => {
    it('debe retornar evm-estado-bien para BIEN', () => {
      expect(component.obtenerClaseEstado('BIEN')).toBe('evm-estado-bien');
    });

    it('debe retornar evm-estado-riesgo para RIESGO', () => {
      expect(component.obtenerClaseEstado('RIESGO')).toBe('evm-estado-riesgo');
    });

    it('debe retornar evm-estado-critico para CRITICO', () => {
      expect(component.obtenerClaseEstado('CRITICO')).toBe('evm-estado-critico');
    });

    it('debe retornar evm-estado-sin-datos para SIN_DATOS', () => {
      expect(component.obtenerClaseEstado('SIN_DATOS')).toBe('evm-estado-sin-datos');
    });
  });

  // ─── obtenerIconoEstado ────────────────────────────────────────────────────

  describe('obtenerIconoEstado', () => {
    it('debe retornar pi-check-circle para BIEN', () => {
      expect(component.obtenerIconoEstado('BIEN')).toContain('pi-check-circle');
    });

    it('debe retornar pi-exclamation-triangle para RIESGO', () => {
      expect(component.obtenerIconoEstado('RIESGO')).toContain('pi-exclamation-triangle');
    });

    it('debe retornar pi-times-circle para CRITICO', () => {
      expect(component.obtenerIconoEstado('CRITICO')).toContain('pi-times-circle');
    });

    it('debe retornar pi-minus-circle para SIN_DATOS', () => {
      expect(component.obtenerIconoEstado('SIN_DATOS')).toContain('pi-minus-circle');
    });
  });

  // ─── formatearMoneda ───────────────────────────────────────────────────────

  describe('formatearMoneda', () => {
    it('debe retornar N/A para null', () => {
      expect(component.formatearMoneda(null)).toBe('N/A');
    });

    it('debe retornar N/A para undefined', () => {
      expect(component.formatearMoneda(undefined as any)).toBe('N/A');
    });

    it('debe retornar una cadena con el valor formateado para un número positivo', () => {
      const resultado = component.formatearMoneda(5000);
      expect(resultado).not.toBe('N/A');
      expect(resultado).toContain('5');
    });

    it('debe retornar una cadena con formato para cero', () => {
      const resultado = component.formatearMoneda(0);
      expect(resultado).not.toBe('N/A');
    });
  });

  // ─── formatearIndice ───────────────────────────────────────────────────────

  describe('formatearIndice', () => {
    it('debe retornar N/A para null', () => {
      expect(component.formatearIndice(null)).toBe('N/A');
    });

    it('debe retornar N/A para undefined', () => {
      expect(component.formatearIndice(undefined as any)).toBe('N/A');
    });

    it('debe retornar el valor redondeado a 2 decimales', () => {
      expect(component.formatearIndice(1.125)).toBe('1.13');
    });

    it('debe retornar 1.00 para el valor exacto 1', () => {
      expect(component.formatearIndice(1)).toBe('1.00');
    });

    it('debe retornar 0.90 para SPI de 0.9', () => {
      expect(component.formatearIndice(0.9)).toBe('0.90');
    });
  });

  // ─── onVerEstadisticas ─────────────────────────────────────────────────────

  describe('onVerEstadisticas', () => {
    it('debe asignar el id de la actividad como string a filtroIndicadores', () => {
      component.onVerEstadisticas(actividadesMock[0]);
      expect(component.filtroIndicadores).toBe('1');
    });

    it('debe asignar el id correcto para distintas actividades', () => {
      component.onVerEstadisticas(actividadesMock[1]);
      expect(component.filtroIndicadores).toBe('2');
    });
  });

  // ─── ngOnInit – interacciones con servicios ────────────────────────────────

  describe('ngOnInit como LIDER', () => {
    it('debe llamar a listarPorProyecto con el id de ruta', () => {
      fixture.detectChanges();
      expect(actividadServiceMock.listarPorProyecto).toHaveBeenCalledWith(1);
    });

    it('debe llamar a obtenerIndicadoresProyecto', () => {
      fixture.detectChanges();
      expect(indicadorEvmServiceMock.obtenerIndicadoresProyecto).toHaveBeenCalled();
    });

    it('debe poblar el arreglo actividades', () => {
      fixture.detectChanges();
      expect(component.actividades.length).toBe(3);
    });
  });

  describe('ngOnInit como COLABORADOR', () => {
    it('NO debe llamar a obtenerIndicadoresProyecto', () => {
      authServiceMock.obtenerUsuario.and.returnValue({ id: 2, rol: 'COLABORADOR', nombre: 'Test', correo: 'test@test.com' });
      fixture.detectChanges();
      expect(indicadorEvmServiceMock.obtenerIndicadoresProyecto).not.toHaveBeenCalled();
    });
  });
});
