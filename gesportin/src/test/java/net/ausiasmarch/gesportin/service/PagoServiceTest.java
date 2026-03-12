package net.ausiasmarch.gesportin.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import net.ausiasmarch.gesportin.entity.PagoEntity;
import net.ausiasmarch.gesportin.repository.PagoRepository;

class PagoServiceTest {

    @Mock
    private PagoRepository pagoRepository;
    @Mock
    private CuotaService cuotaService;
    @Mock
    private JugadorService jugadorService;
    @Mock
    private SessionService sessionService;

    @InjectMocks
    private PagoService pagoService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void count_whenEquipoAdmin_shouldReturnClubCount() {
        when(sessionService.isEquipoAdmin()).thenReturn(true);
        when(sessionService.getIdClub()).thenReturn(42L);
        Page<PagoEntity> page = new PageImpl<>(java.util.Collections.emptyList(), PageRequest.of(0,1), 7);
        when(pagoRepository.findByCuotaEquipoCategoriaTemporadaClubId(42L, PageRequest.ofSize(1))).thenReturn(page);
        assertEquals(7L, pagoService.count());
    }
}
