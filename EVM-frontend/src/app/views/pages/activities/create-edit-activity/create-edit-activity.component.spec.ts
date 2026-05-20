import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { SimpleChange } from '@angular/core';

import {
  CreateEditActivityComponent,
  validarRangoFechas,
} from './create-edit-activity.component';
import { ActividadResponse } from '../../../../core/models/actividad.models';

const actividadMock: ActividadResponse = {
  id: 1,
  idProyecto: 10,
  nombreProyecto: 'Proyecto Test',
  estadoActividad: { id: 2, codigo: 'ACTIVA', nombre: 'Activa', descripcion: '', activo: true },
  nombre: 'Actividad de prueba',
  descripcion: 'Descripción de prueba',
  bac: 5000,
  porcentajeAvancePlanificado: 40,
  porcentajeAvanceReal: 30,
  fechaInicio: '2026-01-01',
  fechaFin: '2026-06-30',
  fechaCreacion: '2026-01-01T00:00:00',
  fechaModificacion: '2026-01-01T00:00:00',
};

describe('CreateEditActivityComponent', () => {
  let component: CreateEditActivityComponent;
  let fixture: ComponentFixture<CreateEditActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateEditActivityComponent],
      providers: [provideAnimationsAsync()],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateEditActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Validador de rango de fechas (función pura exportada)
  // ─────────────────────────────────────────────────────────────────────────

  describe('validarRangoFechas (validador de grupo)', () => {
    it('debe retornar null cuando las fechas son válidas (fin >= inicio)', () => {
      const group = component.formulario;
      group.patchValue({
        fechaInicio: new Date('2026-01-01'),
        fechaFin: new Date('2026-06-30'),
      });
      expect(validarRangoFechas(group)).toBeNull();
    });

    it('debe retornar null cuando fechaInicio == fechaFin', () => {
      const group = component.formulario;
      const fecha = new Date('2026-03-15');
      group.patchValue({ fechaInicio: fecha, fechaFin: fecha });
      expect(validarRangoFechas(group)).toBeNull();
    });

    it('debe retornar error fechaFinAnterior cuando fechaFin < fechaInicio', () => {
      const group = component.formulario;
      group.patchValue({
        fechaInicio: new Date('2026-06-01'),
        fechaFin: new Date('2026-01-01'),
      });
      expect(validarRangoFechas(group)).toEqual({ fechaFinAnterior: true });
    });

    it('debe retornar null cuando alguna fecha es null', () => {
      const group = component.formulario;
      group.patchValue({ fechaInicio: null, fechaFin: new Date('2026-06-01') });
      expect(validarRangoFechas(group)).toBeNull();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Campo: nombre
  // ─────────────────────────────────────────────────────────────────────────

  describe('campo nombre', () => {
    it('debe ser inválido cuando está vacío', () => {
      const ctrl = component.formulario.get('nombre')!;
      ctrl.setValue('');
      ctrl.markAsTouched();
      expect(ctrl.invalid).toBeTrue();
      expect(ctrl.hasError('required')).toBeTrue();
    });

    it('debe ser válido con un nombre corto', () => {
      const ctrl = component.formulario.get('nombre')!;
      ctrl.setValue('Actividad A');
      expect(ctrl.valid).toBeTrue();
    });

    it('debe ser inválido cuando supera 200 caracteres', () => {
      const ctrl = component.formulario.get('nombre')!;
      ctrl.setValue('a'.repeat(201));
      ctrl.markAsTouched();
      expect(ctrl.invalid).toBeTrue();
      expect(ctrl.hasError('maxlength')).toBeTrue();
    });

    it('debe ser válido con exactamente 200 caracteres', () => {
      const ctrl = component.formulario.get('nombre')!;
      ctrl.setValue('a'.repeat(200));
      expect(ctrl.valid).toBeTrue();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Campo: bac
  // ─────────────────────────────────────────────────────────────────────────

  describe('campo bac', () => {
    it('debe ser inválido cuando es null', () => {
      const ctrl = component.formulario.get('bac')!;
      ctrl.setValue(null);
      ctrl.markAsTouched();
      expect(ctrl.invalid).toBeTrue();
      expect(ctrl.hasError('required')).toBeTrue();
    });

    it('debe ser inválido con valor negativo', () => {
      const ctrl = component.formulario.get('bac')!;
      ctrl.setValue(-1);
      ctrl.markAsTouched();
      expect(ctrl.invalid).toBeTrue();
      expect(ctrl.hasError('min')).toBeTrue();
    });

    it('debe ser válido con valor 0 (límite mínimo)', () => {
      const ctrl = component.formulario.get('bac')!;
      ctrl.setValue(0);
      expect(ctrl.valid).toBeTrue();
    });

    it('debe ser válido con valor positivo', () => {
      const ctrl = component.formulario.get('bac')!;
      ctrl.setValue(100000);
      expect(ctrl.valid).toBeTrue();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Campo: porcentajeAvancePlanificado
  // ─────────────────────────────────────────────────────────────────────────

  describe('campo porcentajeAvancePlanificado', () => {
    it('debe ser inválido cuando es null', () => {
      const ctrl = component.formulario.get('porcentajeAvancePlanificado')!;
      ctrl.setValue(null);
      ctrl.markAsTouched();
      expect(ctrl.invalid).toBeTrue();
      expect(ctrl.hasError('required')).toBeTrue();
    });

    it('debe ser inválido con valor negativo', () => {
      const ctrl = component.formulario.get('porcentajeAvancePlanificado')!;
      ctrl.setValue(-0.01);
      ctrl.markAsTouched();
      expect(ctrl.invalid).toBeTrue();
      expect(ctrl.hasError('min')).toBeTrue();
    });

    it('debe ser inválido con valor mayor a 100', () => {
      const ctrl = component.formulario.get('porcentajeAvancePlanificado')!;
      ctrl.setValue(100.01);
      ctrl.markAsTouched();
      expect(ctrl.invalid).toBeTrue();
      expect(ctrl.hasError('max')).toBeTrue();
    });

    it('debe ser válido con valor 0 (mínimo permitido)', () => {
      const ctrl = component.formulario.get('porcentajeAvancePlanificado')!;
      ctrl.setValue(0);
      expect(ctrl.valid).toBeTrue();
    });

    it('debe ser válido con valor 100 (máximo permitido)', () => {
      const ctrl = component.formulario.get('porcentajeAvancePlanificado')!;
      ctrl.setValue(100);
      expect(ctrl.valid).toBeTrue();
    });

    it('debe ser válido con valor intermedio', () => {
      const ctrl = component.formulario.get('porcentajeAvancePlanificado')!;
      ctrl.setValue(55.5);
      expect(ctrl.valid).toBeTrue();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Campo: porcentajeAvanceReal
  // ─────────────────────────────────────────────────────────────────────────

  describe('campo porcentajeAvanceReal', () => {
    it('debe ser inválido cuando es null', () => {
      const ctrl = component.formulario.get('porcentajeAvanceReal')!;
      ctrl.setValue(null);
      ctrl.markAsTouched();
      expect(ctrl.invalid).toBeTrue();
      expect(ctrl.hasError('required')).toBeTrue();
    });

    it('debe ser inválido con valor negativo', () => {
      const ctrl = component.formulario.get('porcentajeAvanceReal')!;
      ctrl.setValue(-0.01);
      ctrl.markAsTouched();
      expect(ctrl.invalid).toBeTrue();
      expect(ctrl.hasError('min')).toBeTrue();
    });

    it('debe ser inválido con valor mayor a 100', () => {
      const ctrl = component.formulario.get('porcentajeAvanceReal')!;
      ctrl.setValue(100.01);
      ctrl.markAsTouched();
      expect(ctrl.invalid).toBeTrue();
      expect(ctrl.hasError('max')).toBeTrue();
    });

    it('debe ser válido con valor 0 (mínimo permitido)', () => {
      const ctrl = component.formulario.get('porcentajeAvanceReal')!;
      ctrl.setValue(0);
      expect(ctrl.valid).toBeTrue();
    });

    it('debe ser válido con valor 100 (máximo permitido)', () => {
      const ctrl = component.formulario.get('porcentajeAvanceReal')!;
      ctrl.setValue(100);
      expect(ctrl.valid).toBeTrue();
    });

    it('debe ser válido con valor intermedio', () => {
      const ctrl = component.formulario.get('porcentajeAvanceReal')!;
      ctrl.setValue(25);
      expect(ctrl.valid).toBeTrue();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Campos: fechaInicio y fechaFin
  // ─────────────────────────────────────────────────────────────────────────

  describe('campo fechaInicio', () => {
    it('debe ser inválido cuando es null', () => {
      const ctrl = component.formulario.get('fechaInicio')!;
      ctrl.setValue(null);
      ctrl.markAsTouched();
      expect(ctrl.invalid).toBeTrue();
      expect(ctrl.hasError('required')).toBeTrue();
    });

    it('debe ser válido con una fecha', () => {
      const ctrl = component.formulario.get('fechaInicio')!;
      ctrl.setValue(new Date('2026-01-01'));
      expect(ctrl.valid).toBeTrue();
    });
  });

  describe('campo fechaFin', () => {
    it('debe ser inválido cuando es null', () => {
      const ctrl = component.formulario.get('fechaFin')!;
      ctrl.setValue(null);
      ctrl.markAsTouched();
      expect(ctrl.invalid).toBeTrue();
      expect(ctrl.hasError('required')).toBeTrue();
    });

    it('debe ser válido con una fecha', () => {
      const ctrl = component.formulario.get('fechaFin')!;
      ctrl.setValue(new Date('2026-12-31'));
      expect(ctrl.valid).toBeTrue();
    });
  });

  describe('validación cruzada de rango de fechas en el grupo', () => {
    it('el formulario debe tener error fechaFinAnterior cuando fechaFin < fechaInicio', () => {
      component.formulario.patchValue({
        fechaInicio: new Date('2026-06-01'),
        fechaFin: new Date('2026-01-01'),
      });
      expect(component.formulario.hasError('fechaFinAnterior')).toBeTrue();
    });

    it('el formulario no debe tener error fechaFinAnterior cuando las fechas son válidas', () => {
      component.formulario.patchValue({
        fechaInicio: new Date('2026-01-01'),
        fechaFin: new Date('2026-06-30'),
      });
      expect(component.formulario.hasError('fechaFinAnterior')).toBeFalse();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Método guardar()
  // ─────────────────────────────────────────────────────────────────────────

  describe('guardar()', () => {
    it('no debe emitir guardarEvento cuando el formulario es inválido', () => {
      const spy = jasmine.createSpy('guardarEvento');
      component.guardarEvento.subscribe(spy);
      component.guardar();
      expect(spy).not.toHaveBeenCalled();
    });

    it('debe marcar todos los campos como touched cuando el formulario es inválido', () => {
      component.guardar();
      expect(component.formulario.get('nombre')?.touched).toBeTrue();
      expect(component.formulario.get('bac')?.touched).toBeTrue();
      expect(component.formulario.get('porcentajeAvancePlanificado')?.touched).toBeTrue();
      expect(component.formulario.get('porcentajeAvanceReal')?.touched).toBeTrue();
      expect(component.formulario.get('fechaInicio')?.touched).toBeTrue();
      expect(component.formulario.get('fechaFin')?.touched).toBeTrue();
    });

    it('no debe emitir guardarEvento cuando fechaFin < fechaInicio', () => {
      const spy = jasmine.createSpy('guardarEvento');
      component.guardarEvento.subscribe(spy);

      component.formulario.patchValue({
        nombre: 'Actividad Test',
        bac: 5000,
        porcentajeAvancePlanificado: 40,
        porcentajeAvanceReal: 30,
        fechaInicio: new Date('2026-06-01'),
        fechaFin: new Date('2026-01-01'),
      });

      component.guardar();
      expect(spy).not.toHaveBeenCalled();
    });

    it('debe emitir guardarEvento con el DTO correcto cuando el formulario es válido', () => {
      const spy = jasmine.createSpy('guardarEvento');
      component.guardarEvento.subscribe(spy);

      component.formulario.patchValue({
        nombre: 'Actividad Test',
        descripcion: 'Descripción de prueba',
        bac: 8000,
        porcentajeAvancePlanificado: 50,
        porcentajeAvanceReal: 40,
        fechaInicio: new Date(2026, 0, 15),
        fechaFin: new Date(2026, 6, 15),
      });

      component.guardar();

      expect(spy).toHaveBeenCalledOnceWith(
        jasmine.objectContaining({
          nombre: 'Actividad Test',
          descripcion: 'Descripción de prueba',
          bac: 8000,
          porcentajeAvancePlanificado: 50,
          porcentajeAvanceReal: 40,
          fechaInicio: '2026-01-15',
          fechaFin: '2026-07-15',
        })
      );
    });

    it('debe emitir guardarEvento sin descripcion cuando el campo está vacío', () => {
      const spy = jasmine.createSpy('guardarEvento');
      component.guardarEvento.subscribe(spy);

      component.formulario.patchValue({
        nombre: 'Actividad Sin Descripcion',
        descripcion: '',
        bac: 1000,
        porcentajeAvancePlanificado: 0,
        porcentajeAvanceReal: 0,
        fechaInicio: new Date(2026, 2, 1),
        fechaFin: new Date(2026, 2, 31),
      });

      component.guardar();
      const dto = spy.calls.mostRecent().args[0];
      expect(dto.descripcion).toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Método cerrar()
  // ─────────────────────────────────────────────────────────────────────────

  describe('cerrar()', () => {
    it('debe emitir cerrarEvento', () => {
      const spy = jasmine.createSpy('cerrarEvento');
      component.cerrarEvento.subscribe(spy);
      component.cerrar();
      expect(spy).toHaveBeenCalled();
    });

    it('debe resetear el formulario', () => {
      component.formulario.patchValue({ nombre: 'Test' });
      component.cerrar();
      expect(component.formulario.get('nombre')?.value).toBeNull();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ngOnChanges
  // ─────────────────────────────────────────────────────────────────────────

  describe('ngOnChanges', () => {
    it('debe cargar los datos de la actividad cuando modoEdicion es true y actividad cambia', () => {
      component.modoEdicion = true;
      component.actividad = actividadMock;
      component.ngOnChanges({
        actividad: new SimpleChange(null, actividadMock, false),
      });

      expect(component.formulario.get('nombre')?.value).toBe('Actividad de prueba');
      expect(component.formulario.get('bac')?.value).toBe(5000);
      expect(component.formulario.get('porcentajeAvancePlanificado')?.value).toBe(40);
      expect(component.formulario.get('porcentajeAvanceReal')?.value).toBe(30);
    });

    it('no debe modificar el formulario cuando modoEdicion es false', () => {
      component.modoEdicion = false;
      component.actividad = actividadMock;
      component.ngOnChanges({
        actividad: new SimpleChange(null, actividadMock, false),
      });

      expect(component.formulario.get('nombre')?.value).toBeFalsy();
    });

    it('debe resetear el formulario cuando visible cambia a false', () => {
      component.formulario.patchValue({ nombre: 'Actividad con datos' });
      component.visible = false;
      component.ngOnChanges({
        visible: new SimpleChange(true, false, false),
      });

      expect(component.formulario.get('nombre')?.value).toBeNull();
    });

    it('no debe resetear el formulario cuando visible cambia a true', () => {
      component.formulario.patchValue({ nombre: 'Actividad con datos' });
      component.visible = true;
      component.ngOnChanges({
        visible: new SimpleChange(false, true, false),
      });

      expect(component.formulario.get('nombre')?.value).toBe('Actividad con datos');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Getters de validación visual
  // ─────────────────────────────────────────────────────────────────────────

  describe('getters de validación visual', () => {
    it('nombreInvalido debe ser true cuando el campo es tocado e inválido', () => {
      const ctrl = component.formulario.get('nombre')!;
      ctrl.setValue('');
      ctrl.markAsTouched();
      expect(component.nombreInvalido).toBeTrue();
    });

    it('nombreInvalido debe ser false cuando el campo tiene valor', () => {
      component.formulario.get('nombre')!.setValue('Nombre válido');
      expect(component.nombreInvalido).toBeFalse();
    });

    it('bacInvalido debe ser true cuando el campo es tocado e inválido', () => {
      const ctrl = component.formulario.get('bac')!;
      ctrl.setValue(null);
      ctrl.markAsTouched();
      expect(component.bacInvalido).toBeTrue();
    });

    it('avancePlanificadoInvalido debe ser true cuando supera 100', () => {
      const ctrl = component.formulario.get('porcentajeAvancePlanificado')!;
      ctrl.setValue(101);
      ctrl.markAsTouched();
      expect(component.avancePlanificadoInvalido).toBeTrue();
    });

    it('avanceRealInvalido debe ser true cuando es negativo', () => {
      const ctrl = component.formulario.get('porcentajeAvanceReal')!;
      ctrl.setValue(-1);
      ctrl.markAsTouched();
      expect(component.avanceRealInvalido).toBeTrue();
    });

    it('fechaFinAnterior debe ser true cuando fechaFin < fechaInicio y fechaFin está tocado', () => {
      component.formulario.patchValue({
        fechaInicio: new Date('2026-06-01'),
        fechaFin: new Date('2026-01-01'),
      });
      component.formulario.get('fechaFin')!.markAsTouched();
      expect(component.fechaFinAnterior).toBeTrue();
    });
  });
});
