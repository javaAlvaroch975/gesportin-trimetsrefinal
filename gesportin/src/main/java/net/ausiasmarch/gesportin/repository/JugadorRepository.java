package net.ausiasmarch.gesportin.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import net.ausiasmarch.gesportin.entity.JugadorEntity;

public interface JugadorRepository extends JpaRepository<JugadorEntity, Long> {
    Page<JugadorEntity> findByPosicionContainingIgnoreCase(String posicion, Pageable pageable);

    Page<JugadorEntity> findByUsuarioId(Long idUsuario, Pageable pageable);

    Page<JugadorEntity> findByEquipoId(Long idEquipo, Pageable pageable);

    // club-restricted queries used by equipo administrators
    Page<JugadorEntity> findByUsuarioClubId(Long clubId, Pageable pageable);

    Page<JugadorEntity> findByEquipoCategoriaTemporadaClubId(Long clubId, Pageable pageable);

    // optional shortcut for when no filter is provided: union of both
    default Page<JugadorEntity> findByClubId(Long clubId, Pageable pageable) {
        // this default implementation is not executed by Spring Data; we’ll call one of the above
        throw new UnsupportedOperationException();
    }
}
