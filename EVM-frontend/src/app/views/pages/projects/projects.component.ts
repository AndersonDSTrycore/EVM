import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProyectoService } from '../../../core/services/proyecto.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ProyectoRequest, ProyectoResponse } from '../../../core/models/proyecto.models';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MenuModule } from 'primeng/menu';
import { Menu } from 'primeng/menu';
import { MessageModule } from 'primeng/message';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    FloatLabelModule,
    InputNumberModule,
    DatePickerModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    MenuModule,
    MessageModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
})
export class ProjectsComponent implements OnInit {
  private proyectoService = inject(ProyectoService);
  private authService = inject(AuthService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  proyectos: ProyectoResponse[] = [];
  cargando = false;
  dialogVisible = false;
  modoEdicion = false;
  idProyectoEditando: number | null = null;
  guardando = false;

  formulario = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(200)]],
    descripcion: [''],
    fechaInicio: [null as Date | null, Validators.required],
    fechaFin: [null as Date | null, Validators.required],
    presupuestoTotal: [null as number | null, [Validators.required, Validators.min(0)]],
  });

  get esLider(): boolean {
    return this.authService.obtenerUsuario()?.rol === 'LIDER';
  }

  @ViewChild('menuProyectos') menuProyectosRef!: Menu;
  menuProyectosItems: MenuItem[] = [];

  abrirMenuProyecto(event: MouseEvent, proyecto: ProyectoResponse): void {
    this.menuProyectosItems = this.obtenerMenuAcciones(proyecto);
    this.menuProyectosRef.toggle(event);
  }

  ngOnInit(): void {
    this.cargarProyectos();
  }

  cargarProyectos(): void {
    this.cargando = true;
    this.proyectoService.listarTodos().subscribe({
      next: (data) => {
        this.proyectos = data;
        this.cargando = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar proyectos' });
        this.cargando = false;
      },
    });
  }

  abrirDialogCrear(): void {
    this.modoEdicion = false;
    this.idProyectoEditando = null;
    this.formulario.reset();
    this.dialogVisible = true;
  }

  abrirDialogEditar(proyecto: ProyectoResponse): void {
    this.modoEdicion = true;
    this.idProyectoEditando = proyecto.id;
    this.formulario.patchValue({
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion ?? '',
      fechaInicio: new Date(proyecto.fechaInicio + 'T00:00:00'),
      fechaFin: new Date(proyecto.fechaFin + 'T00:00:00'),
      presupuestoTotal: proyecto.presupuestoTotal,
    });
    this.dialogVisible = true;
  }

  cerrarDialog(): void {
    this.dialogVisible = false;
    this.formulario.reset();
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const fechaInicio = this.formulario.value.fechaInicio as Date;
    const fechaFin = this.formulario.value.fechaFin as Date;

    if (fechaFin < fechaInicio) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'La fecha de fin no puede ser anterior a la fecha de inicio',
      });
      return;
    }

    const dto: ProyectoRequest = {
      nombre: this.formulario.value.nombre!,
      descripcion: this.formulario.value.descripcion ?? undefined,
      fechaInicio: this.formatearFecha(fechaInicio),
      fechaFin: this.formatearFecha(fechaFin),
      presupuestoTotal: this.formulario.value.presupuestoTotal!,
    };

    this.guardando = true;

    if (this.modoEdicion && this.idProyectoEditando !== null) {
      this.proyectoService.actualizar(this.idProyectoEditando, dto).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Proyecto actualizado correctamente' });
          this.cerrarDialog();
          this.cargarProyectos();
          this.guardando = false;
        },
        error: (err) => {
          const mensaje = err?.error?.message ?? 'Error al actualizar el proyecto';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: mensaje });
          this.guardando = false;
        },
      });
    } else {
      this.proyectoService.crear(dto).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Proyecto creado correctamente' });
          this.cerrarDialog();
          this.cargarProyectos();
          this.guardando = false;
        },
        error: (err) => {
          const mensaje = err?.error?.message ?? 'Error al crear el proyecto';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: mensaje });
          this.guardando = false;
        },
      });
    }
  }

  confirmarCancelar(proyecto: ProyectoResponse): void {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea cancelar el proyecto "<strong>${proyecto.nombre}</strong>"? Esta acción no se puede deshacer.`,
      header: 'Confirmar cancelación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cancelar',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.proyectoService.cancelar(proyecto.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Proyecto cancelado correctamente' });
            this.cargarProyectos();
          },
          error: (err) => {
            const mensaje = err?.error?.message ?? 'Error al cancelar el proyecto';
            this.messageService.add({ severity: 'error', summary: 'Error', detail: mensaje });
          },
        });
      },
    });
  }

  verActividades(proyecto: ProyectoResponse): void {
    this.router.navigate(['/projects', proyecto.id, 'activities']);
  }

  obtenerSeveridadEstado(codigo: string): 'success' | 'danger' | 'warn' | 'info' | 'secondary' {
    switch (codigo) {
      case 'ACTIVO': return 'success';
      case 'CANCELADO': return 'danger';
      case 'PAUSADO': return 'warn';
      case 'FINALIZADO': return 'secondary';
      default: return 'info';
    }
  }

  esCancelado(proyecto: ProyectoResponse): boolean {
    return proyecto.estadoProyecto.codigo === 'CANCELADO';
  }

  obtenerMenuAcciones(proyecto: ProyectoResponse): MenuItem[] {
    const items: MenuItem[] = [
      {
        label: 'Ver actividades',
        icon: 'pi pi-list',
        command: () => this.verActividades(proyecto),
      },
    ];

    if (this.esLider) {
      items.push({
        label: 'Editar proyecto',
        icon: 'pi pi-pencil',
        disabled: this.esCancelado(proyecto),
        command: () => {
          if (!this.esCancelado(proyecto)) {
            this.abrirDialogEditar(proyecto);
          }
        },
      });
      items.push({
        label: 'Cancelar proyecto',
        icon: 'pi pi-times-circle',
        disabled: this.esCancelado(proyecto),
        styleClass: 'menu-item-danger',
        command: () => {
          if (!this.esCancelado(proyecto)) {
            this.confirmarCancelar(proyecto);
          }
        },
      });
    }

    return items;
  }

  private formatearFecha(fecha: Date): string {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  get nombreInvalido(): boolean {
    const c = this.formulario.get('nombre');
    return !!(c?.invalid && c?.touched);
  }

  get fechaInicioInvalida(): boolean {
    const c = this.formulario.get('fechaInicio');
    return !!(c?.invalid && c?.touched);
  }

  get fechaFinInvalida(): boolean {
    const c = this.formulario.get('fechaFin');
    return !!(c?.invalid && c?.touched);
  }

  get presupuestoInvalido(): boolean {
    const c = this.formulario.get('presupuestoTotal');
    return !!(c?.invalid && c?.touched);
  }
}

