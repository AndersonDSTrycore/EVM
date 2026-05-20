import { Component, DestroyRef, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ActividadService } from '../../../core/services/actividad.service';
import { ProyectoService } from '../../../core/services/proyecto.service';
import { AuthService } from '../../../core/auth/auth.service';
import { IndicadorEvmService } from '../../../core/services/indicador-evm.service';
import { ActividadRequest, ActividadResponse } from '../../../core/models/actividad.models';
import { EstadoEvm, IndicadoresEvmProyectoResponse } from '../../../core/models/indicador-evm.models';
import { CreateEditActivityComponent } from './create-edit-activity/create-edit-activity.component';
import { AssignUsersComponent } from './assign-users/assign-users.component';
import { RegistroHorasComponent } from './registro-horas/registro-horas.component';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MenuModule } from 'primeng/menu';
import { Menu } from 'primeng/menu';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CreateEditActivityComponent,
    AssignUsersComponent,
    RegistroHorasComponent,
    TableModule,
    ButtonModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    MenuModule,
    MessageModule,
    InputTextModule,
    ChartModule,
    SkeletonModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './activities.component.html',
  styleUrl: './activities.component.css',
})
export class ActivitiesComponent implements OnInit {
  private actividadService = inject(ActividadService);
  private proyectoService = inject(ProyectoService);
  private authService = inject(AuthService);
  private indicadorEvmService = inject(IndicadorEvmService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  @ViewChild('panelEvm') panelEvm!: ElementRef;
  @ViewChild('menuAcciones') menuAccionesRef!: Menu;
  menuAccionesItems: MenuItem[] = [];

  abrirMenuAcciones(event: MouseEvent, actividad: ActividadResponse): void {
    this.menuAccionesItems = this.obtenerMenuAcciones(actividad);
    this.menuAccionesRef.toggle(event);
  }

  idProyecto!: number;
  nombreProyecto = '';
  actividades: ActividadResponse[] = [];
  cargando = false;
  dialogVisible = false;
  modoEdicion = false;
  actividadEditando: ActividadResponse | null = null;
  guardando = false;

  dialogAsignacionVisible = false;
  actividadAsignando: ActividadResponse | null = null;

  dialogRegistroHorasVisible = false;
  actividadRegistroHoras: ActividadResponse | null = null;

  // EVM
  indicadores: IndicadoresEvmProyectoResponse | null = null;
  cargandoIndicadores = false;
  filtroIndicadores = '';
  chartData: Record<string, unknown> | null = null;
  chartOptions: Record<string, unknown> = {};
  private filtroSubject = new Subject<string>();

  get esLider(): boolean {
    return this.authService.obtenerUsuario()?.rol === 'LIDER';
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.idProyecto = idParam ? +idParam : 0;
    this.inicializarChartOptions();
    this.inicializarDebounce();
    this.cargarNombreProyecto();
    this.cargarActividades();
    this.cargarIndicadores('');
  }

  cargarNombreProyecto(): void {
    this.proyectoService.obtenerPorId(this.idProyecto).subscribe({
      next: (proyecto) => {
        this.nombreProyecto = proyecto.nombre;
      },
      error: () => {
        this.nombreProyecto = '';
      },
    });
  }

  cargarActividades(): void {
    this.cargando = true;
    this.actividadService.listarPorProyecto(this.idProyecto).subscribe({
      next: (data) => {
        this.actividades = data;
        this.cargando = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar las actividades' });
        this.cargando = false;
      },
    });
  }

  cargarIndicadores(filtro: string): void {
    this.cargandoIndicadores = true;
    const filtroTrimado = filtro?.trim() || '';
    this.indicadorEvmService.obtenerIndicadoresProyecto(this.idProyecto, filtroTrimado || undefined).subscribe({
      next: (data) => {
        this.indicadores = data;
        this.construirChartData();
        this.cargandoIndicadores = false;
      },
      error: () => {
        this.cargandoIndicadores = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar los indicadores EVM' });
      },
    });
  }

  onFiltroChange(valor: string): void {
    this.filtroSubject.next(valor);
  }

  onVerEstadisticas(actividad: ActividadResponse): void {
    this.filtroIndicadores = String(actividad.id);
    this.filtroSubject.next(this.filtroIndicadores);
    setTimeout(() => {
      if (this.panelEvm?.nativeElement) {
        this.panelEvm.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  private inicializarDebounce(): void {
    this.filtroSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(filtro => this.cargarIndicadores(filtro));
  }

  private construirChartData(): void {
    if (!this.indicadores) {
      this.chartData = null;
      return;
    }
    this.chartData = {
      labels: ['PV (Planificado)', 'EV (Ganado)', 'AC (Real)'],
      datasets: [
        {
          label: 'Indicadores EVM',
          data: [this.indicadores.pv, this.indicadores.ev, this.indicadores.ac],
          backgroundColor: ['#3B82F6', '#22C55E', '#EF4444'],
          borderColor: ['#2563EB', '#16A34A', '#DC2626'],
          borderWidth: 1,
        },
      ],
    };
  }

  private inicializarChartOptions(): void {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: { raw: number }) =>
              ' $' + new Intl.NumberFormat('es-CO').format(context.raw),
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value: number) =>
              '$' + new Intl.NumberFormat('es-CO', { notation: 'compact' }).format(value),
          },
        },
      },
    };
  }

  obtenerClaseEstado(estado: EstadoEvm): string {
    switch (estado) {
      case 'BIEN': return 'evm-estado-bien';
      case 'RIESGO': return 'evm-estado-riesgo';
      case 'CRITICO': return 'evm-estado-critico';
      default: return 'evm-estado-sin-datos';
    }
  }

  obtenerIconoEstado(estado: EstadoEvm): string {
    switch (estado) {
      case 'BIEN': return 'pi pi-check-circle';
      case 'RIESGO': return 'pi pi-exclamation-triangle';
      case 'CRITICO': return 'pi pi-times-circle';
      default: return 'pi pi-minus-circle';
    }
  }

  formatearMoneda(valor: number | null): string {
    if (valor === null || valor === undefined) return 'N/A';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor);
  }

  formatearIndice(valor: number | null): string {
    if (valor === null || valor === undefined) return 'N/A';
    return valor.toFixed(2);
  }

  // --- Actividades CRUD ---

  abrirDialogCrear(): void {
    this.modoEdicion = false;
    this.actividadEditando = null;
    this.dialogVisible = true;
  }

  abrirDialogEditar(actividad: ActividadResponse): void {
    this.modoEdicion = true;
    this.actividadEditando = actividad;
    this.dialogVisible = true;
  }

  onCerrar(): void {
    this.dialogVisible = false;
    this.actividadEditando = null;
  }

  onGuardar(dto: ActividadRequest): void {
    this.guardando = true;

    if (this.modoEdicion && this.actividadEditando !== null) {
      this.actividadService.actualizar(this.actividadEditando.id, dto).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Actividad actualizada correctamente' });
          this.dialogVisible = false;
          this.actividadEditando = null;
          this.guardando = false;
          this.cargarActividades();
          this.cargarIndicadores(this.filtroIndicadores);
        },
        error: (err) => {
          const mensaje = err?.error?.message ?? 'Error al actualizar la actividad';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: mensaje });
          this.guardando = false;
        },
      });
    } else {
      this.actividadService.crear(this.idProyecto, dto).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Actividad creada correctamente' });
          this.dialogVisible = false;
          this.actividadEditando = null;
          this.guardando = false;
          this.cargarActividades();
          this.cargarIndicadores(this.filtroIndicadores);
        },
        error: (err) => {
          const mensaje = err?.error?.message ?? 'Error al crear la actividad';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: mensaje });
          this.guardando = false;
        },
      });
    }
  }

  confirmarCancelar(actividad: ActividadResponse): void {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea cancelar la actividad "<strong>${actividad.nombre}</strong>"? Esta acción no se puede deshacer.`,
      header: 'Confirmar cancelación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cancelar',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.actividadService.cancelar(actividad.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Actividad cancelada correctamente' });
            this.cargarActividades();
            this.cargarIndicadores(this.filtroIndicadores);
          },
          error: (err) => {
            const mensaje = err?.error?.message ?? 'Error al cancelar la actividad';
            this.messageService.add({ severity: 'error', summary: 'Error', detail: mensaje });
          },
        });
      },
    });
  }

  esCancelada(actividad: ActividadResponse): boolean {
    return actividad.estadoActividad.codigo === 'CANCELADA';
  }

  abrirDialogAsignacion(actividad: ActividadResponse): void {
    this.actividadAsignando = actividad;
    this.dialogAsignacionVisible = true;
  }

  cerrarDialogAsignacion(): void {
    this.dialogAsignacionVisible = false;
    this.actividadAsignando = null;
  }

  abrirDialogRegistroHoras(actividad: ActividadResponse): void {
    this.actividadRegistroHoras = actividad;
    this.dialogRegistroHorasVisible = true;
  }

  cerrarDialogRegistroHoras(): void {
    this.dialogRegistroHorasVisible = false;
    this.actividadRegistroHoras = null;
  }

  obtenerSeveridadEstado(codigo: string): 'success' | 'danger' | 'warn' | 'info' | 'secondary' {
    switch (codigo) {
      case 'ACTIVA': return 'success';
      case 'CANCELADA': return 'danger';
      case 'PAUSADA': return 'warn';
      case 'FINALIZADA': return 'secondary';
      case 'PENDIENTE': return 'info';
      default: return 'info';
    }
  }

  obtenerMenuAcciones(actividad: ActividadResponse): MenuItem[] {
    const items: MenuItem[] = [
      {
        label: 'Ver estadísticas',
        icon: 'pi pi-chart-bar',
        command: () => this.onVerEstadisticas(actividad),
      },
    ];

    if (this.esLider) {
      items.push({
        label: 'Editar actividad',
        icon: 'pi pi-pencil',
        disabled: this.esCancelada(actividad),
        command: () => {
          if (!this.esCancelada(actividad)) {
            this.abrirDialogEditar(actividad);
          }
        },
      });
      items.push({
        label: 'Asignar usuarios',
        icon: 'pi pi-user-plus',
        disabled: this.esCancelada(actividad),
        command: () => {
          if (!this.esCancelada(actividad)) {
            this.abrirDialogAsignacion(actividad);
          }
        },
      });
      items.push({
        label: 'Reporte de horas',
        icon: 'pi pi-clock',
        command: () => {
          this.abrirDialogRegistroHoras(actividad);
        },
      });
      items.push({
        label: 'Cancelar actividad',
        icon: 'pi pi-times-circle',
        disabled: this.esCancelada(actividad),
        styleClass: 'menu-item-danger',
        command: () => {
          if (!this.esCancelada(actividad)) {
            this.confirmarCancelar(actividad);
          }
        },
      });
    }

    return items;
  }
}

