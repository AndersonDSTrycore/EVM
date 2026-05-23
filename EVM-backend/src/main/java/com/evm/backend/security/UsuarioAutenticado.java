package com.evm.backend.security;

import com.evm.backend.domain.Usuario;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Representación del usuario autenticado para Spring Security.
 */
@Getter
public class UsuarioAutenticado implements UserDetails {

    private final Long id;
    private final String nombre;
    private final String correo;
    private final String contrasena;
    private final String codigoRol;
    private final Collection<? extends GrantedAuthority> authorities;

    public UsuarioAutenticado(Usuario usuario) {
        this.id = usuario.getId();
        this.nombre = usuario.getNombre();
        this.correo = usuario.getCorreo();
        this.contrasena = usuario.getContrasena();
        this.codigoRol = usuario.getRolSistema().getCodigo();
        this.authorities = List.of(new SimpleGrantedAuthority("ROLE_" + codigoRol));
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return contrasena;
    }

    @Override
    public String getUsername() {
        return correo;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
