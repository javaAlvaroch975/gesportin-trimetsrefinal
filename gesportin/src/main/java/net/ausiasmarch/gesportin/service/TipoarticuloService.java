package net.ausiasmarch.gesportin.service;

import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import net.ausiasmarch.gesportin.entity.TipoarticuloEntity;
import net.ausiasmarch.gesportin.exception.ResourceNotFoundException;
import net.ausiasmarch.gesportin.repository.TipoarticuloRepository;

@Service
public class TipoarticuloService {

    @Autowired
    private TipoarticuloRepository tipoarticuloRepository;

    private final Random random = new Random();

    private final String[] descripciones = {
        "Equipación oficial", "Material deportivo", "Accesorios", "Calzado deportivo", "Ropa de entrenamiento",
        "Complementos", "Merchandising", "Artículos de portería", "Equipamiento técnico", "Protecciones",
        "Hidratación", "Balones", "Conos y marcadores", "Redes", "Arbitraje",
        "Gimnasio", "Fisioterapia", "Nutrición", "Tecnología deportiva", "Textil técnico",
        "Ropa casual", "Infantil", "Junior", "Senior", "Femenino",
        "Masculino", "Unisex", "Outlet", "Novedades", "Ofertas",
        "Premium", "Básico", "Profesional", "Amateur", "Escolar",
        "Competición", "Ocio", "Verano", "Invierno", "Todo el año",
        "Personalizable", "Edición limitada", "Coleccionismo", "Regalos", "Packs",
        "Temporal", "Permanente", "Exclusivo", "Popular", "Especial"
    };

    public TipoarticuloEntity get(Long id) {
        return tipoarticuloRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tipoarticulo no encontrado con id: " + id));
    }

    public Page<TipoarticuloEntity> getPage(Pageable pageable, String descripcion, Long idClub) {
        if (descripcion != null && !descripcion.isEmpty()) {
            return tipoarticuloRepository.findByDescripcionContainingIgnoreCase(descripcion, pageable);
        } else if (idClub != null) {
            return tipoarticuloRepository.findByIdClub(idClub, pageable);
        } else {
            return tipoarticuloRepository.findAll(pageable);
        }
    }

    public TipoarticuloEntity create(TipoarticuloEntity tipoarticulo) {
        tipoarticulo.setId(null);
        return tipoarticuloRepository.save(tipoarticulo);
    }

    public TipoarticuloEntity update(TipoarticuloEntity tipoarticulo) {
        TipoarticuloEntity tipoarticuloExistente = tipoarticuloRepository.findById(tipoarticulo.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Tipoarticulo no encontrado con id: " + tipoarticulo.getId()));
        
        tipoarticuloExistente.setDescripcion(tipoarticulo.getDescripcion());
        tipoarticuloExistente.setIdClub(tipoarticulo.getIdClub());
        
        return tipoarticuloRepository.save(tipoarticuloExistente);
    }

    public Long delete(Long id) {
        TipoarticuloEntity tipoarticulo = tipoarticuloRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tipoarticulo no encontrado con id: " + id));
        tipoarticuloRepository.delete(tipoarticulo);
        return id;
    }

    public Long empty() {
        tipoarticuloRepository.deleteAll();
        tipoarticuloRepository.flush();
        return 0L;
    }

    public Long count() {
        return tipoarticuloRepository.count();
    }

    public Long fill(Long cantidad) {
        for (int i = 0; i < cantidad; i++) {
            TipoarticuloEntity tipoarticulo = new TipoarticuloEntity();
            tipoarticulo.setDescripcion(descripciones[i % descripciones.length] + " " + (i + 1));
            tipoarticulo.setIdClub((long) (random.nextInt(50) + 1));
            tipoarticuloRepository.save(tipoarticulo);
        }
        return cantidad;
    }
}
