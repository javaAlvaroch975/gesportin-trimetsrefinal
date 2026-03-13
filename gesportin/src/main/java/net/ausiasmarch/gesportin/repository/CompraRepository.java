package net.ausiasmarch.gesportin.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import net.ausiasmarch.gesportin.entity.CompraEntity;

public interface CompraRepository extends JpaRepository<CompraEntity, Long> {
    
    Page<CompraEntity> findByArticuloId(Long idArticulo, Pageable pageable);

    Page<CompraEntity> findByFacturaId(Long idFactura, Pageable pageable);

    // allow users to see purchases by their factura owner
    Page<CompraEntity> findByFacturaUsuarioId(Long idUsuario, Pageable pageable);

    // helpers for equipo-admin
    Page<CompraEntity> findByArticuloTipoarticuloClubId(Long clubId, Pageable pageable);
    Page<CompraEntity> findByFacturaUsuarioClubId(Long clubId, Pageable pageable);

}