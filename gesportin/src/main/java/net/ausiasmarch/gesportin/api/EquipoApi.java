package net.ausiasmarch.gesportin.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import net.ausiasmarch.gesportin.entity.EquipoEntity;
import net.ausiasmarch.gesportin.service.AleatorioService;
import net.ausiasmarch.gesportin.service.EquipoService;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping("/equipo")
public class EquipoApi {
    
    @Autowired
    AleatorioService oAleatorioService;

    @Autowired
    EquipoService oEquipoService;

    // Obtener un equipo por su ID
    @GetMapping("/{id}")
    public ResponseEntity<EquipoEntity> get(@PathVariable Long id) {
        return ResponseEntity.ok(oEquipoService.get(id));
    }

    // Crear un equipo
    @PostMapping("")
    public ResponseEntity<Long> create(@RequestBody EquipoEntity oEquipoEntity) {
        return ResponseEntity.ok(oEquipoService.create(oEquipoEntity));
    }

    // Modificar un equipo
    @PutMapping("")
    public ResponseEntity<Long> update(@RequestBody EquipoEntity oEquipoEntity) {
        return ResponseEntity.ok(oEquipoService.update(oEquipoEntity));
    }

    // Borrar un equipo
    @DeleteMapping("/{id}")
    public ResponseEntity<Long> delete(@PathVariable Long id) {
        return ResponseEntity.ok(oEquipoService.delete(id));
    }

    // Rellenar datos "fake"
    @GetMapping("/rellena/{numPosts}")
    public ResponseEntity<Long> creaEquipo(
            @PathVariable Long numPosts) {
        return ResponseEntity.ok(oEquipoService.creaEquipo(numPosts));
    }

    // Vaciar la tabla (solo para administradores)
    @DeleteMapping("/empty")
    public ResponseEntity<Long> empty() {
        return ResponseEntity.ok(oEquipoService.empty());
    }

    @GetMapping("/count")
    public ResponseEntity<Long> count() {
        return ResponseEntity.ok(oEquipoService.count());
    }
}
