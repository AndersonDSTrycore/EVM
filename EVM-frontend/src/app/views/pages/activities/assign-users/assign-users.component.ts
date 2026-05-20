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
import { AsignacionActividadService } from '../../../../core/services/asignacion-actividad.service';
import {
  AsignacionActividadResponse,
  UsuarioDisponibleResponse,
} from '../../../../core/models/asignacion.models';
import { ActividadResponse } from '../../../../core/models/actividad.models';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-assign-users',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    TableModule,
    TagModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './assign-users.component.html',
  styleUrl: './assign-users.component.css',
})
export class AssignUsersComponent implements OnChanges {
  private asignacionService = inject(AsignacionActividadService);
  private messageService = inject(MessageService);

  @Input() visible = false;
  @Input() actividad: ActividadResponse | null = null;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() cerrarEvento = new EventEmitter<void>();

  asignaciones: AsignacionActividadResponse[] = [];
  disponibles: UsuarioDisponibleResponse[] = [];
  seleccionados: UsuarioDisponibleResponse[] = [];

  cargandoAsignaciones = false;
  cargandoDisponibles = false;
  asignando = false;
  retirandoId: number | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible && this.actividad) {
      this.cargarDatos();
      this.seleccionados = [];
    }
    if (changes['visible'] && !this.visible) {
      this.limpiar();
    }
  }

  cargarDatos(): void {
    if (!this.actividad) return;
    this.cargarAsignaciones();
    this.cargarDisponibles();
  }

  cargarAsignaciones(): void {
    if (!this.actividad) return;
    this.cargandoAsignaciones = true;
    this.asignacionService.listarPorActividad(this.actividad.id).subscribe({
      next: (data) => {
        this.asignaciones = data;
        this.cargandoAsignaciones = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar las asignaciones',
        });
        this.cargandoAsignaciones = false;
      },
    });
  }

  cargarDisponibles(): void {
    if (!this.actividad) return;
    this.cargandoDisponibles = true;
    this.asignacionService.listarUsuariosDisponibles(this.actividad.id).subscribe({
      next: (data) => {
        this.disponibles = data;
        this.cargandoDisponibles = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los usuarios disponibles',
        });
        this.cargandoDisponibles = false;
      },
    });
  }

  toggleSeleccion(usuario: UsuarioDisponibleResponse): void {
    const idx = this.seleccionados.findIndex((u) => u.id === usuario.id);
    if (idx >= 0) {
      this.seleccionados.splice(idx, 1);
    } else {
      this.seleccionados.push(usuario);
    }
  }

  estaSeleccionado(usuario: UsuarioDisponibleResponse): boolean {
    return this.seleccionados.some((u) => u.id === usuario.id);
  }

  asignarSeleccionados(): void {
    if (!this.actividad || this.seleccionados.length === 0) return;
    this.asignando = true;
    this.asignacionService
      .asignar(this.actividad.id, {
        idsUsuarios: this.seleccionados.map((u) => u.id),
      })
      .subscribe({
        next: () => {
          const n = this.seleccionados.length;
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: n === 1
              ? 'Usuario asignado correctamente'
              : `${n} usuarios asignados correctamente`,
          });
          this.seleccionados = [];
          this.asignando = false;
          this.cargarDatos();
        },
        error: (err) => {
          const mensaje = err?.error?.message ?? 'Error al asignar usuarios';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: mensaje });
          this.asignando = false;
        },
      });
  }

  confirmarRetirar(asignacion: AsignacionActividadResponse): void {
    this.retirandoId = asignacion.id;
    this.asignacionService.retirar(asignacion.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `${asignacion.nombreUsuario} retirado de la actividad`,
        });
        this.retirandoId = null;
        this.cargarDatos();
      },
      error: (err) => {
        const mensaje = err?.error?.message ?? 'Error al retirar usuario';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: mensaje });
        this.retirandoId = null;
      },
    });
  }

  esActiva(asignacion: AsignacionActividadResponse): boolean {
    return asignacion.estadoAsignacion?.codigo === 'ACTIVA';
  }

  obtenerSeveridadEstado(codigo: string): 'success' | 'danger' | 'secondary' {
    switch (codigo) {
      case 'ACTIVA': return 'success';
      case 'RETIRADA': return 'danger';
      default: return 'secondary';
    }
  }

  cerrar(): void {
    this.visibleChange.emit(false);
    this.cerrarEvento.emit();
  }

  private limpiar(): void {
    this.asignaciones = [];
    this.disponibles = [];
    this.seleccionados = [];
    this.asignando = false;
    this.retirandoId = null;
  }
}
