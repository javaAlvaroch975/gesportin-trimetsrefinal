package net.ausiasmarch.gesportin.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "comentarioart")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComentarioartEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Size(min = 3, max = 1024)
    private String contenido;

    @NotNull
    @Column(name = "id_articulo", nullable = false)
    private Long idArticulo;

    @NotNull
    @Column(name = "id_usuario", nullable = false)
    private Long idUsuario;

}
