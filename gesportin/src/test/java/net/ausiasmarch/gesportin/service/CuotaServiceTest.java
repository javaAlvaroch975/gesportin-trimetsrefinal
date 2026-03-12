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

import net.ausiasmarch.gesportin.entity.CuotaEntity;
import net.ausiasmarch.gesportin.repository.CuotaRepository;

class CuotaServiceTest {

    @Mock
    private CuotaRepository cuotaRepository;
    @Mock
    private EquipoService equipoService;
    @Mock
    private SessionService sessionService;

    @InjectMocks
    private CuotaService cuotaService;

    private CuotaEntity exampleCuota;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        exampleCuota = new CuotaEntity();
        exampleCuota.setId(5L);
        // set equipo with club id 42
        exampleCuota.setEquipo(new net.ausiasmarch.gesportin.entity.EquipoEntity());
        exampleCuota.getEquipo().setCategoria(new net.ausiasmarch.gesportin.entity.CategoriaEntity());
        exampleCuota.getEquipo().getCategoria().setTemporada(new net.ausiasmarch.gesportin.entity.TemporadaEntity());
        exampleCuota.getEquipo().getCategoria().getTemporada().setClub(new net.ausiasmarch.gesportin.entity.ClubEntity());
        exampleCuota.getEquipo().getCategoria().getTemporada().getClub().setId(42L);
    }

    @Test
    void count_whenEquipoAdmin_shouldReturnClubCount() {
        when(sessionService.isEquipoAdmin()).thenReturn(true);
        when(sessionService.getIdClub()).thenReturn(42L);
        Page<CuotaEntity> page = new PageImpl<>(java.util.Collections.emptyList(), PageRequest.of(0,1), 3);
        when(cuotaRepository.findByEquipoCategoriaTemporadaClubId(42L, PageRequest.ofSize(1))).thenReturn(page);
        assertEquals(3L, cuotaService.count());
    }
}
