package net.ausiasmarch.gesportin.entity;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "club")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClubEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(name = "dirección", nullable = false)
    private String direccion;

    @Column(name = "teléfono", nullable = false)
    private String telefono;

    @Column(name = "fecha_alta", nullable = false)
    private LocalDateTime fechaAlta;

    @Lob
    @Column(nullable = false)
    private byte[] imagen;

    
    @Getter(AccessLevel.NONE)
    @OneToMany(mappedBy = "club", fetch = FetchType.LAZY)
    private List<TemporadaEntity> temporadas;

    
    @Getter(AccessLevel.NONE)
    @OneToMany(mappedBy = "club", fetch = FetchType.LAZY)
    private List<NoticiaEntity> noticias;

    
    @Getter(AccessLevel.NONE)
    @OneToMany(mappedBy = "club", fetch = FetchType.LAZY)
    private List<TipoarticuloEntity> tipoarticulos;

    
    @Getter(AccessLevel.NONE)
    @OneToMany(mappedBy = "club", fetch = FetchType.LAZY)
    private List<UsuarioEntity> usuarios;

   
    public int getTemporadas() {
        return temporadas.size();
    }

   
    public int getNoticias() {
        return noticias.size();
    }

   
    public int getTipoarticulos() {
        return tipoarticulos.size();
    }

   
    public int getUsuarios() {
        return usuarios.size();
    }
}
