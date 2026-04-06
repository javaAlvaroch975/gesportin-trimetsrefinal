package net.ausiasmarch.gesportin.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "estadopartido")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstadopartidoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String descripcion;

    @Getter(AccessLevel.NONE)
    @OneToMany(mappedBy = "estadopartido", fetch = FetchType.LAZY)
    private java.util.List<PartidoEntity> partidos;

    public int getPartidos() {
        return partidos != null ? partidos.size() : 0;
    }
}
