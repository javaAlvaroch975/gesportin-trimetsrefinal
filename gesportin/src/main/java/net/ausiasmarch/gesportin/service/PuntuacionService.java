package net.ausiasmarch.gesportin.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import net.ausiasmarch.gesportin.entity.PuntuacionEntity;
import net.ausiasmarch.gesportin.exception.ResourceNotFoundException;
import net.ausiasmarch.gesportin.exception.UnauthorizedException;
import net.ausiasmarch.gesportin.repository.PuntuacionRepository;

@Service
public class PuntuacionService {

    @Autowired
    private PuntuacionRepository oPuntuacionRepository;

    @Autowired
    private AleatorioService oAleatorioService;

    @Autowired
    private NoticiaService oNoticiaService;

    @Autowired
    private UsuarioService oUsuarioService;

    @Autowired
    private SessionService oSessionService;

    public PuntuacionEntity get(Long id) {
        PuntuacionEntity e = oPuntuacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Puntuación no encontrado con id: " + id));
        if (oSessionService.isEquipoAdmin()) {
            Long clubId = e.getNoticia().getClub().getId();
            oSessionService.checkSameClub(clubId);
        }
        return e;
    }

    public Page<PuntuacionEntity> getPage(Pageable pageable, Long id_noticia, Long id_usuario) {
        if (oSessionService.isEquipoAdmin()) {
            Long myClub = oSessionService.getIdClub();
            if (id_noticia != null) {
                Long clubNot = oNoticiaService.get(id_noticia).getClub().getId();
                if (!myClub.equals(clubNot)) {
                    throw new UnauthorizedException("Acceso denegado: solo puntuaciones de su club");
                }
            }
            if (id_usuario != null) {
                Long clubUsr = oUsuarioService.get(id_usuario).getClub().getId();
                if (!myClub.equals(clubUsr)) {
                    throw new UnauthorizedException("Acceso denegado: solo puntuaciones de su club");
                }
            }
            if (id_noticia == null && id_usuario == null) {
                return oPuntuacionRepository.findByNoticiaClubId(myClub, pageable);
            }
        }
        if (id_noticia != null) {
            return oPuntuacionRepository.findByNoticiaId(id_noticia, pageable);
        } else if (id_usuario != null) {
            return oPuntuacionRepository.findByUsuarioId(id_usuario, pageable);
        } else {
            return oPuntuacionRepository.findAll(pageable);
        }
    }

    public PuntuacionEntity create(PuntuacionEntity oPuntuacionEntity) {
        if (oSessionService.isEquipoAdmin()) {
            throw new UnauthorizedException("Acceso denegado: no puede gestionar puntuaciones");
        }
        oPuntuacionEntity.setId(null); 
        oPuntuacionEntity.setNoticia(oNoticiaService.get(oPuntuacionEntity.getNoticia().getId()));
        oPuntuacionEntity.setUsuario(oUsuarioService.get(oPuntuacionEntity.getUsuario().getId()));
        return oPuntuacionRepository.save(oPuntuacionEntity);
    }

    public PuntuacionEntity update(PuntuacionEntity oPuntuacionEntity) {
        if (oSessionService.isEquipoAdmin()) {
            throw new UnauthorizedException("Acceso denegado: no puede gestionar puntuaciones");
        }
        PuntuacionEntity oPuntuacionExistente = oPuntuacionRepository.findById(oPuntuacionEntity.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Puntuación no encontrado con id: " + oPuntuacionEntity.getId()));

        oPuntuacionExistente.setPuntuacion(oPuntuacionEntity.getPuntuacion());
        oPuntuacionExistente.setNoticia(oNoticiaService.get(oPuntuacionEntity.getNoticia().getId()));
        oPuntuacionExistente.setUsuario(oUsuarioService.get(oPuntuacionEntity.getUsuario().getId()));
        return oPuntuacionRepository.save(oPuntuacionExistente);
    }

    public Long delete(Long id) {
        if (oSessionService.isEquipoAdmin()) {
            throw new UnauthorizedException("Acceso denegado: no puede gestionar puntuaciones");
        }
        PuntuacionEntity oPuntuacion = oPuntuacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Puntuación no encontrado con id: " + id));
        oPuntuacionRepository.delete(oPuntuacion);
        return id;
    }

    public Long count() {
        return oPuntuacionRepository.count();
    }

    public Long empty() {
        oPuntuacionRepository.deleteAll();
        oPuntuacionRepository.flush();
        return 0L;
    }

    public Long fill(Long cantidad) {
        for (int i = 0; i < cantidad; i++) {
            PuntuacionEntity oPuntuacion = new PuntuacionEntity();
            oPuntuacion.setPuntuacion(oAleatorioService.generarNumeroAleatorioEnteroEnRango(1, 5));
            oPuntuacion.setNoticia(oNoticiaService.getOneRandom());
            oPuntuacion.setUsuario(oUsuarioService.getOneRandom());
            oPuntuacionRepository.save(oPuntuacion);
        }
        return cantidad;
    }
}
