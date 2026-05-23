package com.evm.backend.service;

import com.evm.backend.dto.auth.LoginRequestDTO;
import com.evm.backend.dto.auth.LoginResponseDTO;

public interface AuthService {

    LoginResponseDTO login(LoginRequestDTO request);
}
