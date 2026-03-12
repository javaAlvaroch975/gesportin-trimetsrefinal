package net.ausiasmarch.gesportin.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import net.ausiasmarch.gesportin.entity.CuotaEntity;

public interface CuotaRepository extends JpaRepository<CuotaEntity, Long> {

    Page<CuotaEntity> findByDescripcionContainingIgnoreCase(String descripcion, Pageable pageable);

    Page<CuotaEntity> findByEquipoId(Long idEquipo, Pageable pageable); 

    // used by equipo-admin to restrict cuotas to their club
    Page<CuotaEntity> findByEquipoCategoriaTemporadaClubId(Long clubId, Pageable pageable);
}
