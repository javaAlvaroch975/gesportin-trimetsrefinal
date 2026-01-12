package net.ausiasmarch.gesportin.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import net.ausiasmarch.gesportin.entity.PartidoEntity;

public interface PartidoRepository extends JpaRepository<PartidoEntity, Long> {

    Page<PartidoEntity> findByPublicadoTrue(Pageable oPageable);

    Page<PartidoEntity> findByPublicadoFalse(Pageable oPageable);

    PartidoEntity findByIdAndPublicadoTrue(Long id);
    
}
