package net.ausiasmarch.gesportin.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import net.ausiasmarch.gesportin.entity.TipoarticuloEntity;
import net.ausiasmarch.gesportin.service.TipoarticuloService;

@CrossOrigin(origins = "*", allowedHeaders = "*", maxAge = 3600)
@RestController
@RequestMapping("/tipoarticulo")
public class TipoarticuloApi {

    @Autowired
    private TipoarticuloService tipoarticuloService;

    @GetMapping("/{id}")
    public ResponseEntity<TipoarticuloEntity> get(@PathVariable Long id) {
        return ResponseEntity.ok(tipoarticuloService.get(id));
    }

    @GetMapping
    public ResponseEntity<Page<TipoarticuloEntity>> getPage(
            @PageableDefault(size = 1000) Pageable pageable,
            @RequestParam(required = false) String descripcion,
            @RequestParam(required = false) Long idClub) {
        return ResponseEntity.ok(tipoarticuloService.getPage(pageable, descripcion, idClub));
    }

    @PostMapping
    public ResponseEntity<TipoarticuloEntity> create(@RequestBody TipoarticuloEntity tipoarticulo) {
        return ResponseEntity.ok(tipoarticuloService.create(tipoarticulo));
    }

    @PutMapping
    public ResponseEntity<TipoarticuloEntity> update(@RequestBody TipoarticuloEntity tipoarticulo) {
        return ResponseEntity.ok(tipoarticuloService.update(tipoarticulo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Long> delete(@PathVariable Long id) {
        return ResponseEntity.ok(tipoarticuloService.delete(id));
    }

    @GetMapping("/fill/{cantidad}")
    public ResponseEntity<Long> fill(@PathVariable Long cantidad) {
        return ResponseEntity.ok(tipoarticuloService.fill(cantidad));
    }

    @GetMapping("/fill")
    public ResponseEntity<Long> fillDefault() {
        return ResponseEntity.ok(tipoarticuloService.fill(50L));
    }

    @DeleteMapping("/empty")
    public ResponseEntity<Long> empty() {
        return ResponseEntity.ok(tipoarticuloService.empty());
    }

    @GetMapping("/count")
    public ResponseEntity<Long> count() {
        return ResponseEntity.ok(tipoarticuloService.count());
    }
}
