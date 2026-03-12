package net.ausiasmarch.gesportin.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import net.ausiasmarch.gesportin.entity.FacturaEntity;
import net.ausiasmarch.gesportin.exception.ResourceNotFoundException;
import net.ausiasmarch.gesportin.exception.UnauthorizedException;
import net.ausiasmarch.gesportin.repository.FacturaRepository;

@Service
public class FacturaService {

    @Autowired
    private FacturaRepository oFacturaRepository;

    @Autowired
    private UsuarioService oUsuarioService;

    @Autowired
    private AleatorioService oAleatorioService;

    @Autowired
    private SessionService oSessionService;

    public FacturaEntity get(Long id) {
        FacturaEntity e = oFacturaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Factura no encontrado con id: " + id));
        if (oSessionService.isEquipoAdmin()) {
            Long clubId = e.getUsuario().getClub().getId();
            oSessionService.checkSameClub(clubId);
        }
        return e;
    }

    public Page<FacturaEntity> getPage(Pageable pageable, Long id_usuario) {
        if (oSessionService.isEquipoAdmin()) {
            Long myClub = oSessionService.getIdClub();
            if (id_usuario != null) {
                Long clubUsr = oUsuarioService.get(id_usuario).getClub().getId();
                if (!myClub.equals(clubUsr)) {
                    throw new UnauthorizedException("Acceso denegado: solo facturas de su club");
                }
            }
            if (id_usuario == null) {
                return oFacturaRepository.findByUsuarioClubId(myClub, pageable);
            }
        }
        if (id_usuario != null) {
            return oFacturaRepository.findByUsuarioId(id_usuario, pageable);
        } else {
            return oFacturaRepository.findAll(pageable);
        }
    }

    public FacturaEntity create(FacturaEntity oFacturaEntity) {
        if (oSessionService.isEquipoAdmin()) {
            throw new UnauthorizedException("Acceso denegado: equipo‑admin no puede crear facturas");
        }
        oFacturaEntity.setId(null);
        oFacturaEntity.setFecha(LocalDateTime.now());
        oFacturaEntity.setUsuario(oUsuarioService.get(oFacturaEntity.getUsuario().getId()));
        return oFacturaRepository.save(oFacturaEntity);
    }

    public FacturaEntity update(FacturaEntity oFacturaEntity) {
        if (oSessionService.isEquipoAdmin()) {
            throw new UnauthorizedException("Acceso denegado: equipo‑admin no puede modificar facturas");
        }
        FacturaEntity oFacturaExistente = oFacturaRepository.findById(oFacturaEntity.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Factura no encontrado con id: " + oFacturaEntity.getId()));
        oFacturaExistente.setUsuario(oUsuarioService.get(oFacturaEntity.getUsuario().getId()));
        oFacturaExistente.setFecha(oFacturaEntity.getFecha());
        return oFacturaRepository.save(oFacturaExistente);
    }

    public Long delete(Long id) {
        if (oSessionService.isEquipoAdmin()) {
            throw new UnauthorizedException("Acceso denegado: equipo‑admin no puede borrar facturas");
        }
        FacturaEntity oFactura = oFacturaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Factura no encontrado con id: " + id));
        oFacturaRepository.delete(oFactura);
        return id;
    }

    public Long count() {
        return oFacturaRepository.count();
    }

    public Long empty() {
        oFacturaRepository.deleteAll();
        oFacturaRepository.flush();
        return 0L;
    }

    public Long fill(Long cantidad) {
        for (int i = 0; i < cantidad; i++) {
            FacturaEntity oFactura = new FacturaEntity();
            // escoger una fecha de factura aleatoria en los ultimos 5 años
            oFactura.setFecha(LocalDateTime.now().minusDays(oAleatorioService.generarNumeroAleatorioEnteroEnRango(0, 1825)));
            oFactura.setUsuario(oUsuarioService.getOneRandom());
            oFacturaRepository.save(oFactura);
        }
        return cantidad;
    }

    public FacturaEntity getOneRandom() {
        Long count = oFacturaRepository.count();
        if (count == 0) {
            return null;
        }
        int index = (int) (Math.random() * count);
        return oFacturaRepository.findAll(Pageable.ofSize(1).withPage(index)).getContent().get(0);
    }

}
