package com.evm.backend.service.impl;

import com.evm.backend.domain.Usuario;
import com.evm.backend.dto.auth.LoginRequestDTO;
import com.evm.backend.dto.auth.LoginResponseDTO;
import com.evm.backend.dto.auth.UsuarioSesionDTO;
import com.evm.backend.repository.UsuarioRepository;
import com.evm.backend.security.JwtService;
import com.evm.backend.security.UsuarioAutenticado;
import com.evm.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    @Transactional(readOnly = true)
    public LoginResponseDTO login(LoginRequestDTO request) {
        Usuario usuario = usuarioRepository.findByCorreo(request.getCorreo())
                .orElseThrow(() -> {
                    log.warn("Intento de login con correo inexistente: {}", request.getCorreo());
                    return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas");
                });

        if (!passwordEncoder.matches(request.getContrasena(), usuario.getContrasena())) {
            log.warn("Contraseña incorrecta para usuario: {}", request.getCorreo());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas");
        }

        String codigoEstado = usuario.getEstadoUsuario().getCodigo();

        if ("INACTIVO".equals(codigoEstado) || "BLOQUEADO".equals(codigoEstado)) {
            log.warn("Login rechazado por estado {} para usuario: {}", codigoEstado, request.getCorreo());
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "El usuario no está habilitado para acceder al sistema");
        }

        UsuarioAutenticado usuarioAutenticado = new UsuarioAutenticado(usuario);
        String token = jwtService.generarToken(usuarioAutenticado);

        log.info("Login exitoso para usuario: {} con rol: {}", usuario.getCorreo(), usuario.getRolSistema().getCodigo());

        return LoginResponseDTO.builder()
                .token(token)
                .tipoToken("Bearer")
                .usuario(UsuarioSesionDTO.builder()
                        .id(usuario.getId())
                        .nombre(usuario.getNombre())
                        .correo(usuario.getCorreo())
                        .rol(usuario.getRolSistema().getCodigo())
                        .build())
                .build();
    }
}
