import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ActividadRequest, ActividadResponse } from '../../../../core/models/actividad.models';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';

export function validarRangoFechas(group: AbstractControl): ValidationErrors | null {
  const inicio = group.get('fechaInicio')?.value as Date | null;
  const fin = group.get('fechaFin')?.value as Date | null;
  if (inicio && fin && fin < inicio) {
    return { fechaFinAnterior: true };
  }
  return null;
}

@Component({
  selector: 'app-create-edit-activity',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    FloatLabelModule,
    InputNumberModule,
    DatePickerModule,
  ],
  templateUrl: './create-edit-activity.component.html',
  styleUrl: './create-edit-activity.component.css',
})
export class CreateEditActivityComponent implements OnChanges {
  private fb = inject(FormBuilder);

  @Input() visible = false;
  @Input() modoEdicion = false;
  @Input() guardando = false;
  @Input() actividad: ActividadResponse | null = null;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() guardarEvento = new EventEmitter<ActividadRequest>();
  @Output() cerrarEvento = new EventEmitter<void>();

  formulario = this.fb.group(
    {
      nombre: ['', [Validators.required, Validators.maxLength(200)]],
      descripcion: [''],
      bac: [null as number | null, [Validators.required, Validators.min(0)]],
      porcentajeAvancePlanificado: [
        null as number | null,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      porcentajeAvanceReal: [
        null as number | null,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      fechaInicio: [null as Date | null, Validators.required],
      fechaFin: [null as Date | null, Validators.required],
    },
    { validators: validarRangoFechas }
  );

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['actividad'] && this.actividad && this.modoEdicion) {
      this.formulario.patchValue({
        nombre: this.actividad.nombre,
        descripcion: this.actividad.descripcion ?? '',
        bac: this.actividad.bac,
        porcentajeAvancePlanificado: this.actividad.porcentajeAvancePlanificado,
        porcentajeAvanceReal: this.actividad.porcentajeAvanceReal,
        fechaInicio: new Date(this.actividad.fechaInicio + 'T00:00:00'),
        fechaFin: new Date(this.actividad.fechaFin + 'T00:00:00'),
      });
    }
    if (changes['visible'] && !this.visible) {
      this.formulario.reset();
    }
  }

  get nombreInvalido(): boolean {
    const ctrl = this.formulario.get('nombre');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  get bacInvalido(): boolean {
    const ctrl = this.formulario.get('bac');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  get avancePlanificadoInvalido(): boolean {
    const ctrl = this.formulario.get('porcentajeAvancePlanificado');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  get avanceRealInvalido(): boolean {
    const ctrl = this.formulario.get('porcentajeAvanceReal');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  get fechaInicioInvalida(): boolean {
    const ctrl = this.formulario.get('fechaInicio');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  get fechaFinInvalida(): boolean {
    const ctrl = this.formulario.get('fechaFin');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  get fechaFinAnterior(): boolean {
    return !!(
      this.formulario.hasError('fechaFinAnterior') &&
      this.formulario.get('fechaFin')?.touched
    );
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const fechaInicio = this.formulario.value.fechaInicio as Date;
    const fechaFin = this.formulario.value.fechaFin as Date;

    const dto: ActividadRequest = {
      nombre: this.formulario.value.nombre!,
      descripcion: this.formulario.value.descripcion || undefined,
      bac: this.formulario.value.bac!,
      porcentajeAvancePlanificado: this.formulario.value.porcentajeAvancePlanificado!,
      porcentajeAvanceReal: this.formulario.value.porcentajeAvanceReal!,
      fechaInicio: this.formatearFecha(fechaInicio),
      fechaFin: this.formatearFecha(fechaFin),
    };

    this.guardarEvento.emit(dto);
  }

  cerrar(): void {
    this.formulario.reset();
    this.visibleChange.emit(false);
    this.cerrarEvento.emit();
  }

  private formatearFecha(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }
}
