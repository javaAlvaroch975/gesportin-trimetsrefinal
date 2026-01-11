package net.ausiasmarch.gesportin.service;

import java.util.ArrayList;
import java.util.Random;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import net.ausiasmarch.gesportin.entity.EquipoEntity;
import net.ausiasmarch.gesportin.exception.ResourceNotFoundException;
import net.ausiasmarch.gesportin.exception.UnauthorizedException;
import net.ausiasmarch.gesportin.repository.EquipoRepository;

@Service
public class EquipoService {

    Random azar = new Random();

    @Autowired
    EquipoRepository oEquipoRepository;

    @Autowired
    AleatorioService oAleatorioService;

    @Autowired
    SessionService oSessionService;

    ArrayList<String> equipos = new ArrayList<>();

    public EquipoService() {
        equipos.add("Real Madrid");
        equipos.add("FC Barcelona");
        equipos.add("Atlético de Madrid");
        equipos.add("Athletic Club");
        equipos.add("Valencia CF");
        equipos.add("Sevilla FC");
        equipos.add("Real Betis");
        equipos.add("Real Sociedad");
        equipos.add("Villareal CF");
        equipos.add("Celta de Vigo");
    }

    public Long crearEquipo(Long numPosts) {
        if (!oSessionService.isSessionActive()) {
            throw new UnauthorizedException("Sesión no activa");
        }

        for (long j = 0; j < numPosts; j++) {

            // Crea una entidad y la rellana con datos aleatorios
            EquipoEntity oEquipoEntity = new EquipoEntity();

            oEquipoEntity.setNombre(
                    equipos.get(oAleatorioService.GenerarNumeroAleatorioEnteroEnRango(0, equipos.size() - 1)));
            
            oEquipoEntity.setId_club(azar.nextLong(1, 10));

            oEquipoEntity.setId_entrenador(azar.nextLong(1, 10));

            oEquipoEntity.setId_categoria(azar.nextLong(1, 10));

            oEquipoEntity.setId_liga(azar.nextLong(1, 10));

            oEquipoEntity.setId_temporada(azar.nextLong(1, 10));
            
            // Guardar la entidad en la base de datos
            oEquipoRepository.save(oEquipoEntity);
        }
        return oEquipoRepository.count();
    }

    // -------------------------------------------------- CRUD --------------------------------------------------

    public EquipoEntity get(Long id) {
        if (!oSessionService.isSessionActive()) {
            throw new UnauthorizedException("Sesión no activa");
        }

        return oEquipoRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado"));
    }

    public Long create(EquipoEntity EquipoEntity) {
        if (!oSessionService.isSessionActive()) {
            throw new UnauthorizedException("Sesión no activa");
        }

        oEquipoRepository.save(EquipoEntity);
        return EquipoEntity.getId();
    }

    public Long update(EquipoEntity EquipoEntity) {
        if (!oSessionService.isSessionActive()) {
            throw new UnauthorizedException("Sesión no activa");
        }

        EquipoEntity oExistingEquipo = oEquipoRepository.findById(EquipoEntity.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado"));
        oExistingEquipo.setNombre(EquipoEntity.getNombre());
        oExistingEquipo.setId_club(EquipoEntity.getId_club());
        oExistingEquipo.setId_entrenador(EquipoEntity.getId_entrenador());
        oExistingEquipo.setId_categoria(EquipoEntity.getId_categoria());
        oExistingEquipo.setId_liga(EquipoEntity.getId_liga());
        oExistingEquipo.setId_temporada(EquipoEntity.getId_temporada());
        oEquipoRepository.save(oExistingEquipo);
        return oExistingEquipo.getId();
    }

    public Long delete(Long id) {
        if (!oSessionService.isSessionActive()) {
            throw new UnauthorizedException("Sesión no activa");
        }

        oEquipoRepository.deleteById(id);
        return id;
    }

    public Page<EquipoEntity> getPage(Pageable oPageable) {
        if (!oSessionService.isSessionActive()) {
            throw new UnauthorizedException("Sesión no activa");
        } else {
            return oEquipoRepository.findAll(oPageable);
        }
    }


    public Long count() {
        return oEquipoRepository.count();
    }

    // Vaciar la tabla (solo para administradores)
    public Long empty() {
        if (!oSessionService.isSessionActive()) {
            throw new UnauthorizedException("Sesión no activa");
        }

        Long total = oEquipoRepository.count();
        oEquipoRepository.deleteAll();
        return total;
    }
}
