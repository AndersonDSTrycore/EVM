import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../../core/auth/auth.service";
import { LoginRequest } from "../../../core/models/auth.models";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { FloatLabelModule } from "primeng/floatlabel";
import { MessageModule } from "primeng/message";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    FloatLabelModule,
    MessageModule,
  ],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.css",
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  formulario = this.fb.group({
    correo: ["", [Validators.required, Validators.email]],
    contrasena: ["", Validators.required],
  });

  cargando = false;
  mensajeError = "";

  get correoInvalido() {
    const control = this.formulario.get("correo");
    return control?.invalid && control?.touched;
  }

  get contrasenaInvalida() {
    const control = this.formulario.get("contrasena");
    return control?.invalid && control?.touched;
  }

  iniciarSesion(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.mensajeError = "";

    const request: LoginRequest = {
      correo: this.formulario.value.correo!,
      contrasena: this.formulario.value.contrasena!,
    };

    this.authService.login(request).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(["/dashboard"]);
      },
      error: (error) => {
        this.cargando = false;
        if (error.status === 401) {
          this.mensajeError = "Credenciales invalidas.";
        } else {
          this.mensajeError = "Error al conectar con el servidor. Intente nuevamente.";
        }
      },
    });
  }
}
