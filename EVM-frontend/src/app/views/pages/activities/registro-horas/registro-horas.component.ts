import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RegistroHorasService } from '../../../../core/services/registro-horas.service';
import { AsignacionActividadService } from '../../../../core/services/asignacion-actividad.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { WebSocketService } from '../../../../core/services/web-socket.service';
import { RegistroHorasResponse } from '../../../../core/models/registro-horas.models';
import { AsignacionActividadResponse } from '../../../../core/models/asignacion.models';
import { ActividadResponse } from '../../../../core/models/actividad.models';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { FloatLabelModule } from 'primeng/floatlabel';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-registro-horas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    TableModule,
    InputNumberModule,
    DatePickerModule,
    TextareaModule,
    FloatLabelModule,
    SelectModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './registro-horas.component.html',
  styleUrl: './registro-horas.component.css',
})
export class RegistroHorasComponent implements OnChanges, OnDestroy {
  private registroHorasService = inject(RegistroHorasService);
  private asignacionService = inject(AsignacionActividadService);
  private authService = inject(AuthService);
  private webSocketService = inject(WebSocketService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  @Input() visible = false;
  @Input() actividad: ActividadResponse | null = null;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() cerrarEvento = new EventEmitter<void>();

  registros: RegistroHorasResponse[] = [];
  asignacionesActivas: AsignacionActividadResponse[] = [];
  cargandoRegistros = false;
  guardando = false;

  formulario = this.fb.group({
    idUsuario: [null as number | null, Validators.required],
    fechaTrabajo: [null as Date | null, Validators.required],
    horasTrabajadas: [null as number | null, [Validators.required, Validators.min(1)]],
    descripcion: [''],
  });

  get esLider(): boolean {
    return this.authService.obtenerUsuario()?.rol === 'LIDER';
  }

  get totalHoras(): number {
    return this.registros.reduce((sum, r) => sum + r.horasTrabajadas, 0);
  }

  get totalCosto(): number {
    return this.registros.reduce((sum, r) => sum + r.costoTotal, 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible && this.actividad) {
      this.cargarDatos();
      this.suscribirWebSocket();
    }
    if (changes['visible'] && !this.visible) {
      this.resetFormulario();
      this.cancelarSuscripcionWebSocket();
    }
  }

  ngOnDestroy(): void {
    this.cancelarSuscripcionWebSocket();
  }

  cargarDatos(): void {
    if (!this.actividad) return;
    this.cargarRegistros();
    if (this.esLider) {
      this.cargarAsignacionesActivas();
    } else {
      // Colaborador: preseleccionar su propio id
      const usuario = this.authService.obtenerUsuario();
      if (usuario) {
        this.formulario.get('idUsuario')?.setValue(usuario.id);
      }
    }
  }

  cargarRegistros(): void {
    if (!this.actividad) return;
    this.cargandoRegistros = true;
    this.registroHorasService.listarPorActividad(this.actividad.id).subscribe({
      next: (data) => {
        this.registros = data;
        this.cargandoRegistros = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los registros de horas',
        });
        this.cargandoRegistros = false;
      },
    });
  }

  cargarAsignacionesActivas(): void {
    if (!this.actividad) return;
    this.asignacionService.listarPorActividad(this.actividad.id).subscribe({
      next: (data) => {
        this.asignacionesActivas = data.filter(
          (a) => a.estadoAsignacion.codigo === 'ACTIVA'
        );
      },
      error: () => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'No se pudieron cargar los usuarios asignados',
        });
      },
    });
  }

  guardar(): void {
    if (this.formulario.invalid || !this.actividad) return;

    const valores = this.formulario.getRawValue();
    const fechaDate = valores.fechaTrabajo as Date;
    const fechaStr = this.formatearFecha(fechaDate);

    const dto = {
      idUsuario: valores.idUsuario as number,
      fechaTrabajo: fechaStr,
      horasTrabajadas: valores.horasTrabajadas as number,
      descripcion: valores.descripcion || undefined,
    };

    this.guardando = true;
    this.registroHorasService.registrar(this.actividad.id, dto).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Horas registradas correctamente',
        });
        this.resetFormulario();
        this.cargarRegistros();
        this.guardando = false;
      },
      error: (err) => {
        const mensaje = err?.error?.message ?? 'Error al registrar horas';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: mensaje });
        this.guardando = false;
      },
    });
  }

  cerrar(): void {
    this.resetFormulario();
    this.visibleChange.emit(false);
    this.cerrarEvento.emit();
  }

  private suscribirWebSocket(): void {
    if (!this.actividad) return;
    const clave = 'registro-horas-dialog-' + this.actividad.id;
    const canal = `/topic/actividades/${this.actividad.id}/registros-horas`;
    try {
      this.webSocketService.suscribir(canal, clave).subscribe({
        next: (evento) => {
          if (evento.requiereRefresco) {
            this.cargarRegistros();
          }
        },
        error: (err) => console.error('[WS] Error en suscripción registros-horas dialog:', err),
      });
    } catch (err) {
      console.error('[WS] No se pudo suscribir en registro-horas:', err);
    }
  }

  private cancelarSuscripcionWebSocket(): void {
    if (!this.actividad) return;
    this.webSocketService.cancelarSuscripcion('registro-horas-dialog-' + this.actividad.id);
  }

  private resetFormulario(): void {
    this.formulario.reset();
    this.registros = [];
    this.asignacionesActivas = [];
  }

  private formatearFecha(fecha: Date): string {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
