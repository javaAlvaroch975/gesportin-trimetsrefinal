package net.ausiasmarch.gesportin.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import net.ausiasmarch.gesportin.entity.TipoarticuloEntity;

@Getter
@Setter
@NoArgsConstructor
public class TipoarticuloDTO extends TipoarticuloEntity {

    private Double totalVentas;

    @JsonIgnore
    @Getter(onMethod_ = @JsonIgnore)
    private int articulosCount;

    public TipoarticuloDTO(TipoarticuloEntity entity, Double totalVentas) {
        setId(entity.getId());
        setDescripcion(entity.getDescripcion());
        setClub(entity.getClub());
        this.articulosCount = entity.getArticulos();
        this.totalVentas = totalVentas;
    }

    @Override
    public int getArticulos() {
        return articulosCount;
    }
}
