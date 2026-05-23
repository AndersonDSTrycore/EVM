import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe mostrar 2 ítems de menú', () => {
    expect(component.menuItems.length).toBe(2);
  });

  it('debe tener las rutas Dashboard y Projects', () => {
    const rutas = component.menuItems.map((i) => i.route);
    expect(rutas).toContain('/dashboard');
    expect(rutas).toContain('/projects');
  });

  it('debe colapsar cuando colapsado es true', () => {
    component.colapsado = true;
    fixture.detectChanges();
    const aside = fixture.nativeElement.querySelector('aside');
    expect(aside.classList).toContain('sidebar--collapsed');
  });
});
