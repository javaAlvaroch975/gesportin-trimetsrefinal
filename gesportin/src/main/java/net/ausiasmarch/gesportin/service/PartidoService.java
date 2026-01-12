package net.ausiasmarch.gesportin.service;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import net.ausiasmarch.gesportin.entity.PartidoEntity;
import net.ausiasmarch.gesportin.exception.ResourceNotFoundException;
import net.ausiasmarch.gesportin.exception.UnauthorizedException;
import net.ausiasmarch.gesportin.repository.PartidoRepository;

@Service
public class PartidoService {

    @Autowired
    PartidoRepository oPartidoRepository;

    @Autowired
    SessionService oSessionService;

        @Autowired
        AleatorioService oAleatorioService;

        private List<String> alRivales = Arrays.asList(
            "Atlético", "Barcelona", "Real Madrid", "Sevilla", "Valencia", "Villarreal", "Betis",
            "Real Sociedad", "Granada", "Celta", "Getafe", "Espanyol", "Mallorca", "Osasuna", "Alavés");

    // -------------CRUD-----------------

    //GET:

    public PartidoEntity get(Long id) {
        if (oSessionService.isSessionActive()) {
            return oPartidoRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        } else{
            PartidoEntity partidoEntity = oPartidoRepository.findByIdAndPublicadoTrue(id);
            if (partidoEntity == null) {
                throw new ResourceNotFoundException("Post not found or not published");
            }
            return partidoEntity;
        }
    }

    //GET PAGE:

     public Page<PartidoEntity> getPage(Pageable oPageable) {
        // si no hay session activa, solo devolver los publicados
        if (!oSessionService.isSessionActive()) {
            return oPartidoRepository.findByPublicadoTrue(oPageable);
        } else {
            return oPartidoRepository.findAll(oPageable);
        }
    }

    //CREATE:

     public Long create(PartidoEntity partidoEntity) {
        if (!oSessionService.isSessionActive()) {
            throw new UnauthorizedException("No active session");
        }
        partidoEntity.setNombre_rival(null);
        partidoEntity.setId_equipo(0);
        partidoEntity.setLocal(null);
        partidoEntity.setResultado(null);
        oPartidoRepository.save(partidoEntity);
        return partidoEntity.getId();
    }

    //UPDATE:

    public Long update(PartidoEntity partidoEntity) {
        if (!oSessionService.isSessionActive()) {
            throw new UnauthorizedException("No active session");
        }
        PartidoEntity existingPartido = oPartidoRepository.findById(partidoEntity.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        existingPartido.setNombre_rival(partidoEntity.getNombre_rival());
        existingPartido.setId_equipo(partidoEntity.getId_equipo());
        existingPartido.setLocal(partidoEntity.getLocal());
        existingPartido.setResultado(partidoEntity.getResultado());
        oPartidoRepository.save(existingPartido);
        return existingPartido.getId();
    }

    //DELETE:

    public Long delete(Long id) {
        if (!oSessionService.isSessionActive()) {
            throw new UnauthorizedException("No active session");
        }
        oPartidoRepository.deleteById(id);
        return id;
    }

    //FILL:

    public Long rellenaPartido(Long numPosts) {

        if (!oSessionService.isSessionActive()) {
            throw new UnauthorizedException("No active session");
        }

        for (long j = 0; j < numPosts; j++) {
            PartidoEntity oPartidoEntity = new PartidoEntity();
            String rival = alRivales.get(oAleatorioService.GenerarNumeroAleatorioEnteroEnRango(0, alRivales.size() - 1));
            oPartidoEntity.setNombre_rival(rival);
            oPartidoEntity.setId_equipo(oAleatorioService.GenerarNumeroAleatorioEnteroEnRango(1, 20));
            oPartidoEntity.setLocal(oAleatorioService.GenerarNumeroAleatorioEnteroEnRango(0, 1) == 1);
            int golesLocal = oAleatorioService.GenerarNumeroAleatorioEnteroEnRango(0, 5);
            int golesVisitante = oAleatorioService.GenerarNumeroAleatorioEnteroEnRango(0, 5);
            oPartidoEntity.setResultado(golesLocal + "-" + golesVisitante);
            oPartidoRepository.save(oPartidoEntity);
        }
        return oPartidoRepository.count();
    }

    //EMPTY (VACIAR TABLA):

    public Long empty() {
        if (!oSessionService.isSessionActive()) {
            throw new UnauthorizedException("No active session");
        }
        Long total = oPartidoRepository.count();
        oPartidoRepository.deleteAll();
        return total;
    }

    //COUNT:

    public Long count() {
        return oPartidoRepository.count();
    }
    
}
