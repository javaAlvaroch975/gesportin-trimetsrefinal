package net.ausiasmarch.gesportin.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import net.ausiasmarch.gesportin.entity.LigaEntity;

public interface LigaRepository extends JpaRepository<LigaEntity, Long> {
    Page<LigaEntity> findByNombreContainingIgnoreCase(String nombre, Pageable pageable);
    Page<LigaEntity> findByEquipoId(Long idEquipo, Pageable pageable);

    // filter ligas according to the club of the equipo (used by equipo-admin)
    Page<LigaEntity> findByEquipoCategoriaTemporadaClubId(Long clubId, Pageable pageable);
}
